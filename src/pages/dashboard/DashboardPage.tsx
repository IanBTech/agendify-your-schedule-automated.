import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Calendar, Clock, Users, Link2, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { differenceInDays, format } from "date-fns";
import { toast } from "sonner";

export default function DashboardPage() {
  const { profile } = useAuth();

  const { data: agendamentos } = useQuery({
    queryKey: ["agendamentos", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("agendamentos")
        .select("*, servicos(nome_servico, preco)")
        .eq("profissional_id", profile!.id)
        .order("data", { ascending: true });
      return data ?? [];
    },
  });

  const { data: clientesCount } = useQuery({
    queryKey: ["clientes-count", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { count } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .eq("profissional_id", profile!.id);
      return count ?? 0;
    },
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const todayCount = agendamentos?.filter((a) => a.data === today && a.status !== "cancelado").length ?? 0;
  const weekCount = agendamentos?.filter((a) => {
    const d = new Date(a.data);
    const now = new Date();
    const diffDays = differenceInDays(d, now);
    return diffDays >= 0 && diffDays < 7 && a.status !== "cancelado";
  }).length ?? 0;
  const monthCount = agendamentos?.filter((a) => {
    const d = new Date(a.data);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && a.status !== "cancelado";
  }).length ?? 0;

  const diasRestantes = profile ? Math.max(0, differenceInDays(new Date(profile.data_expiracao_teste), new Date())) : 0;

  const stats = [
    { label: "Atendimentos hoje", value: String(todayCount), icon: Clock },
    { label: "Esta semana", value: String(weekCount), icon: Calendar },
    { label: "Este mês", value: String(monthCount), icon: BarChart3 },
    { label: "Total de clientes", value: String(clientesCount ?? 0), icon: Users },
  ];

  const nextAppointments = agendamentos
    ?.filter((a) => a.data >= today && a.status === "confirmado")
    .slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      {profile?.plano === "teste" && (
        <div className="rounded-xl gradient-primary p-4">
          <p className="text-primary-foreground font-semibold text-sm">
            🎉 Você está no período de teste gratuito
          </p>
          <p className="text-primary-foreground/70 text-xs mt-0.5">
            Restam {diasRestantes} dias. Aproveite todas as funcionalidades.
          </p>
        </div>
      )}

      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      {profile?.slug && (
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Seu link de agendamento</p>
                <p className="text-sm font-medium truncate">{window.location.origin}/book/{profile.slug}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/book/${profile.slug}`);
                  toast.success("Link copiado!");
                }}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/book/${profile.slug}`, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Abrir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
          {nextAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">Nenhum agendamento ainda.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Configure seus serviços e compartilhe seu link.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {nextAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{a.cliente_nome || "Cliente"}</p>
                    <p className="text-xs text-muted-foreground">{(a as any).servicos?.nome_servico}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{format(new Date(a.data), "dd/MM")}</p>
                    <p className="text-xs text-muted-foreground">{a.horario}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
