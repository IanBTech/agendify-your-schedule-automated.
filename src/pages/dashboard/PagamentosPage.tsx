import { useState, useEffect } from "react";
import { CreditCard, Key, QrCode, Copy, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

const plans = [
  {
    key: "solo",
    name: "Solo",
    price: "49",
    priceAnual: "39",
    features: ["1 profissional", "Agendamentos ilimitados", "QR code", "Página de agendamento", "Lembretes por email"],
  },
  {
    key: "empresa",
    name: "Empresa",
    price: "99",
    priceAnual: "79",
    features: ["Múltiplos profissionais", "Múltiplos calendários", "Gestão de equipe", "Tudo do Solo", "Relatórios avançados", "Suporte prioritário"],
    popular: true,
  },
];

// --- Admin config section ---
function AdminPaymentConfig() {
  const [asaasApiKey, setAsaasApiKey] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("agendify_payment_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setAsaasApiKey(parsed.asaasApiKey || "");
        setPixKey(parsed.pixKey || "");
      }
    } catch {}
  }, []);

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem("agendify_payment_config", JSON.stringify({ asaasApiKey, pixKey }));
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações de pagamento salvas!");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold">Configurações do Admin</h2>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" /> Integração Asaas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure sua chave de API do Asaas para receber pagamentos via PIX automaticamente.
          </p>
          <div className="space-y-2">
            <Label>Chave de API Asaas</Label>
            <Input
              type="password"
              placeholder="$aact_..."
              value={asaasApiKey}
              onChange={(e) => setAsaasApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Encontre sua chave em: Asaas → Configurações → Integração → API
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" /> Chave PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chave PIX para recebimento</Label>
            <Input
              placeholder="CPF, CNPJ, email ou chave aleatória"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Planos configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {plans.map((plan) => (
              <div key={plan.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">Plano {plan.name}</p>
                  <p className="text-xs text-muted-foreground">R$ {plan.price}/mês</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">Ativo</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button variant="hero" onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar configurações"}
      </Button>
    </div>
  );
}

// --- User subscription section ---
function UserSubscription() {
  const { profile, refreshProfile } = useAuth();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const diasRestantes = profile ? Math.max(0, differenceInDays(new Date(profile.data_expiracao_teste), new Date())) : 0;
  const currentPlan = profile?.plano || "teste";

  const handleSubscribe = async (planKey: string, planPrice: string) => {
    setSubscribing(planKey);
    setPixCode(null);

    try {
      // Try calling the edge function for Asaas PIX generation
      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        body: {
          plan: planKey,
          price: parseFloat(planPrice),
          userId: profile?.user_id,
          userName: profile?.nome,
          userEmail: profile?.email,
        },
      });

      if (error) throw error;

      if (data?.pixCode) {
        setPixCode(data.pixCode);
        toast.success("PIX gerado com sucesso!");
      } else if (data?.fallback) {
        // Fallback: generate a static PIX code for manual payment
        const fallbackCode = `00020126580014br.gov.bcb.pix0136agendify-${planKey}-${profile?.user_id?.slice(0, 8)}5204000053039865802BR5913AGENDIFY6008SAOPAULO62070503***6304`;
        setPixCode(fallbackCode);
        toast.info("PIX gerado (modo simulado). Configure a API Asaas para pagamentos reais.");
      }
    } catch {
      // Fallback when edge function is not available
      const fallbackCode = `00020126580014br.gov.bcb.pix0136agendify-${planKey}-${Date.now()}5204000053039865802BR5913AGENDIFY6008SAOPAULO62070503***6304`;
      setPixCode(fallbackCode);
      toast.info("PIX gerado em modo demonstração. Para pagamentos reais, o admin precisa configurar a API Asaas.");
    } finally {
      setSubscribing(null);
    }
  };

  const handleCopyPix = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = async (planKey: string) => {
    // Simulate payment confirmation - updates the user's plan
    const { error } = await supabase
      .from("profiles")
      .update({ plano: planKey })
      .eq("user_id", profile!.user_id);

    if (error) {
      toast.error("Erro ao ativar plano.");
    } else {
      toast.success(`Plano ${planKey} ativado com sucesso!`);
      setPixCode(null);
      await refreshProfile();
    }
  };

  return (
    <div className="space-y-6">
      {currentPlan === "teste" && (
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm font-medium text-primary">
            🎉 Teste gratuito — Restam {diasRestantes} dias
          </p>
        </div>
      )}

      {currentPlan !== "teste" && (
        <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-4">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            ✅ Seu plano atual: <strong className="capitalize">{currentPlan}</strong>
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.key;
          return (
            <Card key={plan.key} className={`shadow-card ${plan.popular ? "border-primary" : ""}`}>
              <CardContent className="p-6">
                {plan.popular && (
                  <span className="inline-block px-2 py-0.5 rounded-full gradient-primary text-primary-foreground text-xs font-semibold mb-3">
                    Mais popular
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="font-display text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">ou R$ {plan.priceAnual}/mês no plano anual</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano atual
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className="w-full"
                    onClick={() => handleSubscribe(plan.key, plan.price)}
                    disabled={subscribing === plan.key}
                  >
                    {subscribing === plan.key ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Gerando PIX...</>
                    ) : (
                      "Assinar com PIX"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pixCode && (
        <Card className="shadow-card border-primary">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" /> Pagamento PIX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copie o código abaixo e cole no app do seu banco para pagar:
            </p>
            <div className="relative">
              <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all select-all">
                {pixCode}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1"
                onClick={handleCopyPix}
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
              <div className="text-center">
                <QrCode className="h-32 w-32 text-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">QR Code (requer integração Asaas)</p>
              </div>
            </div>

            <Button variant="hero" className="w-full" onClick={() => handleSimulatePayment(plans.find(p => pixCode.includes(p.key))?.key || "solo")}>
              Confirmar pagamento (demonstração)
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Em produção, a confirmação será automática via webhook do Asaas.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardContent className="p-6">
          <h3 className="font-display font-semibold mb-2">Pagamento via PIX</h3>
          <p className="text-sm text-muted-foreground">
            Aceitamos pagamento via PIX para sua comodidade. Após a confirmação do pagamento, seu plano é ativado automaticamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main page ---
export default function PagamentosPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">
        {isAdmin ? "Pagamentos & Configuração" : "Planos & Assinatura"}
      </h1>

      {isAdmin && <AdminPaymentConfig />}

      <UserSubscription />
    </div>
  );
}
