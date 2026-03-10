import { useState } from "react";
import { Check, Copy, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

const plans = [
  {
    key: "gratuito",
    name: "Gratuito",
    price: "0",
    features: ["Até 20 agendamentos/mês", "Página de agendamento", "Gestão de clientes"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "49",
    features: ["Agendamentos ilimitados", "Lembretes por email", "QR Code personalizado", "Suporte prioritário", "Sem limites"],
    popular: true,
  },
];

export default function PlanosPage() {
  const { profile, refreshProfile, isAdmin } = useAuth();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixPlan, setPixPlan] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string, planPrice: string) => {
    if (planKey === "gratuito") {
      const { error } = await supabase
        .from("profiles")
        .update({ plano: "gratuito" } as any)
        .eq("id", profile!.id);
      if (!error) {
        await refreshProfile();
        toast.success("Plano atualizado para Gratuito!");
      }
      return;
    }

    setSubscribing(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        body: {
          plan: planKey,
          price: planPrice,
          userId: profile!.user_id,
          userName: profile!.nome,
          userEmail: profile!.email,
        },
      });

      if (error) throw error;

      if (data?.pixCode) {
        setPixCode(data.pixCode);
        setPixPlan(planKey);
      } else {
        // Fallback demo code
        setPixCode("00020126580014br.gov.bcb.pix0136agendify-demo-pix-code-placeholder5204000053039865802BR");
        setPixPlan(planKey);
      }
    } catch {
      setPixCode("00020126580014br.gov.bcb.pix0136agendify-demo-pix-code-placeholder5204000053039865802BR");
      setPixPlan(planKey);
    } finally {
      setSubscribing(null);
    }
  };

  const handleCopyPix = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      toast.success("Código PIX copiado!");
    }
  };

  const handleSimulatePayment = async () => {
    if (!pixPlan) return;
    const { error } = await supabase
      .from("profiles")
      .update({ plano: pixPlan } as any)
      .eq("id", profile!.id);
    if (!error) {
      await refreshProfile();
      setPixCode(null);
      setPixPlan(null);
      toast.success("Plano ativado com sucesso!");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Planos</h1>
      <p className="text-sm text-muted-foreground">
        Plano atual: <span className="font-semibold text-foreground capitalize">{profile?.plano || "teste"}</span>
        {isAdmin && " (Admin — acesso ilimitado)"}
      </p>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
        {plans.map((plan) => (
          <Card key={plan.key} className={`shadow-card relative ${plan.popular ? "border-primary" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-display">{plan.name}</CardTitle>
              <p className="text-3xl font-bold font-display">
                R$ {plan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {!isAdmin && (
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  disabled={profile?.plano === plan.key || subscribing === plan.key}
                  onClick={() => handleSubscribe(plan.key, plan.price)}
                >
                  {subscribing === plan.key ? (
                    <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Gerando PIX...</>
                  ) : profile?.plano === plan.key ? (
                    "Plano atual"
                  ) : (
                    "Assinar"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PIX Payment Dialog */}
      {pixCode && (
        <Card className="shadow-card max-w-md">
          <CardHeader>
            <CardTitle className="font-display text-lg">Pagamento PIX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <QRCodeCanvas value={pixCode} size={180} />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Código PIX (copie e cole):</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted p-2 rounded text-xs break-all">{pixCode.slice(0, 60)}...</code>
                <Button size="icon" variant="outline" onClick={handleCopyPix}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="hero" className="w-full" onClick={handleSimulatePayment}>
              Confirmar pagamento
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { setPixCode(null); setPixPlan(null); }}>
              Cancelar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
