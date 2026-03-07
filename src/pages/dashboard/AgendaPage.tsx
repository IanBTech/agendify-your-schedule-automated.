import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Pencil, Trash2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import ManualBookingDialog from "@/components/ManualBookingDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AgendaPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [editDate, setEditDate] = useState("");
  const [editHorario, setEditHorario] = useState("");

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

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, data, horario }: { id: string; data: string; horario: string }) => {
      const { error } = await supabase
        .from("agendamentos")
        .update({ data, horario } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      setEditingAppointment(null);
      toast.success("Agendamento reagendado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agendamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      toast.success("Agendamento excluído!");
    },
  });

  const openEdit = (a: any) => {
    setEditingAppointment(a);
    setEditDate(a.data);
    setEditHorario(a.horario?.slice(0, 5) || "");
  };

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

  const renderCard = (a: any, showDate = false) => (
    <Card key={a.id} className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold truncate">{a.cliente_nome || "Cliente"}</p>
            <p className="text-sm text-muted-foreground">{(a as any).servicos?.nome_servico}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3.5 w-3.5" />
              {showDate && `${format(new Date(a.data), "dd/MM")} • `}
              {a.horario?.slice(0, 5)}
            </p>
            {a.cliente_telefone && (
              <p className="text-xs text-muted-foreground mt-0.5">📞 {a.cliente_telefone}</p>
            )}
            {a.cliente_email && (
              <p className="text-xs text-muted-foreground">✉️ {a.cliente_email}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(a.status)}`}>
              {a.status}
            </span>
            <div className="flex gap-1 flex-wrap justify-end">
              {a.status === "confirmado" && (
                <>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatusMutation.mutate({ id: a.id, status: "concluido" })}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Concluir
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatusMutation.mutate({ id: a.id, status: "cancelado" })}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openEdit(a)}>
                    <CalendarClock className="h-3.5 w-3.5 mr-1" /> Reagendar
                  </Button>
                </>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(a.id)} className="bg-destructive text-destructive-foreground">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Agenda</h1>
        <ManualBookingDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["agenda"] })} />
      </div>

      {/* Today */}
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
          <div className="space-y-3">{todayAgendamentos.map((a: any) => renderCard(a))}</div>
        )}
      </div>

      {/* Future */}
      {futureAgendamentos.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">Próximos</h2>
          <div className="space-y-3">{futureAgendamentos.map((a: any) => renderCard(a, true))}</div>
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={(open) => !open && setEditingAppointment(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reagendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nova data</Label>
              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Novo horário</Label>
              <Input type="time" value={editHorario} onChange={(e) => setEditHorario(e.target.value)} />
            </div>
            <Button
              variant="hero"
              className="w-full"
              disabled={!editDate || !editHorario || rescheduleMutation.isPending}
              onClick={() => rescheduleMutation.mutate({ id: editingAppointment.id, data: editDate, horario: editHorario })}
            >
              {rescheduleMutation.isPending ? "Salvando..." : "Confirmar reagendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
