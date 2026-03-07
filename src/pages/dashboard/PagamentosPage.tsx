import { useState } from "react";
import { CreditCard, Key, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function PagamentosPage() {
  const [asaasApiKey, setAsaasApiKey] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Store locally for now — real integration requires edge function + secrets
    localStorage.setItem("agendify_payment_config", JSON.stringify({ asaasApiKey, pixKey }));
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações de pagamento salvas!");
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Configurações de Pagamento</h1>

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
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Plano Solo</p>
                <p className="text-xs text-muted-foreground">R$ 49/mês</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">Ativo</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Plano Empresa</p>
                <p className="text-xs text-muted-foreground">R$ 99/mês</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">Ativo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="hero" onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar configurações"}
      </Button>
    </div>
  );
}
