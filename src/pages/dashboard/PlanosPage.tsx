import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays } from "date-fns";

const plans = [
  {
    name: "Solo",
    price: "49",
    priceAnual: "39",
    features: ["1 profissional", "Agendamentos ilimitados", "QR code", "Página de agendamento", "Lembretes por email"],
    popular: false,
  },
  {
    name: "Empresa",
    price: "99",
    priceAnual: "79",
    features: ["Múltiplos profissionais", "Múltiplos calendários", "Gestão de equipe", "Tudo do Solo", "Relatórios avançados", "Suporte prioritário"],
    popular: true,
  },
];

export default function PlanosPage() {
  const { profile } = useAuth();
  const diasRestantes = profile ? Math.max(0, differenceInDays(new Date(profile.data_expiracao_teste), new Date())) : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Planos</h1>

      {profile?.plano === "teste" && (
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm font-medium text-primary">
            🎉 Teste gratuito de 14 dias — Restam {diasRestantes} dias
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`shadow-card ${plan.popular ? "border-primary" : ""}`}>
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
              <Button variant={plan.popular ? "hero" : "outline"} className="w-full">
                Contratar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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
