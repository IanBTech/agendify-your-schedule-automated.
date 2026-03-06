import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AgendaPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: agendamentos = [] } = useQuery({
    queryKey: ["agenda", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("agendamentos")
        .select("*, servicos(nome_servico, preco, duracao_minutos)")
        .eq("profissional_id", profile!.id)
        .gte("data", today)
        .order("data", { ascending: true })
        .order("horario", { ascending: true });
      return data ?? [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      toast.success("Status atualizado!");
    },
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmado": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelado": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "concluido": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const todayAgendamentos = agendamentos.filter((a: any) => a.data === today);
  const futureAgendamentos = agendamentos.filter((a: any) => a.data > today);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Agenda</h1>

      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Hoje — {format(new Date(), "dd/MM/yyyy")}</h2>
        {todayAgendamentos.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayAgendamentos.map((a: any) => (
              <Card key={a.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{a.cliente_nome || "Cliente"}</p>
                      <p className="text-sm text-muted-foreground">{(a as any).servicos?.nome_servico}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3.5 w-3.5" /> {a.horario?.slice(0, 5)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(a.status)}`}>
                        {a.status}
                      </span>
                      {a.status === "confirmado" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: a.id, status: "concluido" })}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Concluir
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: a.id, status: "cancelado" })}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {futureAgendamentos.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">Próximos</h2>
          <div className="space-y-3">
            {futureAgendamentos.map((a: any) => (
              <Card key={a.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{a.cliente_nome || "Cliente"}</p>
                      <p className="text-sm text-muted-foreground">{(a as any).servicos?.nome_servico}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3.5 w-3.5" /> {format(new Date(a.data), "dd/MM")} • {a.horario?.slice(0, 5)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(a.status)}`}>
                      {a.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
