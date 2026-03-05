import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const plans = [
  {
    name: "Básico",
    price: "29",
    features: ["Até 50 agendamentos/mês", "1 serviço", "Link de agendamento", "Lembretes por email"],
    current: false,
  },
  {
    name: "Profissional",
    price: "59",
    features: ["Agendamentos ilimitados", "Serviços ilimitados", "Calendário avançado", "Lista de espera", "Estatísticas", "Programa de indicação"],
    current: false,
    popular: true,
  },
  {
    name: "Premium",
    price: "99",
    features: ["Tudo do Profissional", "Múltiplas agendas", "API personalizada", "Suporte prioritário", "Domínio personalizado"],
    current: false,
  },
];

export default function PlanosPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Planos</h1>
      <div className="rounded-xl bg-primary/10 p-4">
        <p className="text-sm font-medium text-primary">
          🎉 Teste gratuito — Restam 7 dias
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
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
    </div>
  );
}
