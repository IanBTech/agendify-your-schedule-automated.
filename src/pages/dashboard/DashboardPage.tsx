import { BarChart3, Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Atendimentos hoje", value: "0", icon: Clock, change: "" },
  { label: "Esta semana", value: "0", icon: Calendar, change: "" },
  { label: "Este mês", value: "0", icon: BarChart3, change: "" },
  { label: "Total de clientes", value: "0", icon: Users, change: "" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Trial banner */}
      <div className="rounded-xl gradient-primary p-4 flex items-center justify-between">
        <div>
          <p className="text-primary-foreground font-semibold text-sm">
            🎉 Você está no período de teste gratuito
          </p>
          <p className="text-primary-foreground/70 text-xs mt-0.5">
            Restam 7 dias. Aproveite todas as funcionalidades.
          </p>
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Próximos agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">Nenhum agendamento ainda.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Configure seus serviços e compartilhe seu link.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
