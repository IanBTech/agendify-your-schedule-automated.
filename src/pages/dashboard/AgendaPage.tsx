import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Trash2, CalendarClock, Plus, History, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import ManualBookingDialog from "@/components/ManualBookingDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type ViewMode = "day" | "history";
type HistoryFilter = "today" | "week" | "month" | "all";

export default function AgendaPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("month");
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [editDate, setEditDate] = useState("");
  const [editHorario, setEditHorario] = useState("");

  // Fetch ALL appointments for the professional
  const { data: allAgendamentos = [] } = useQuery({
    queryKey: ["agenda-all", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("agendamentos")
        .select("*, servicos(nome_servico, preco, duracao_minutos)")
        .eq("profissional_id", profile!.id)
        .order("data", { ascending: false })
        .order("horario", { ascending: false });
      return data ?? [];
    },
  });

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Day view: appointments for selected date
  const dayAgendamentos = useMemo(() =>
    allAgendamentos
      .filter((a: any) => a.data === selectedDateStr)
      .sort((a: any, b: any) => a.horario.localeCompare(b.horario)),
    [allAgendamentos, selectedDateStr]
  );

  // History view with filters
  const historyAgendamentos = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    return allAgendamentos.filter((a: any) => {
      if (historyFilter === "today") return a.data === todayStr;
      if (historyFilter === "week") {
        const ws = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
        const we = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
        return a.data >= ws && a.data <= we;
      }
      if (historyFilter === "month") {
        const ms = format(startOfMonth(now), "yyyy-MM-dd");
        const me = format(endOfMonth(now), "yyyy-MM-dd");
        return a.data >= ms && a.data <= me;
      }
      return true; // "all"
    });
  }, [allAgendamentos, historyFilter]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda-all"] });
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
      queryClient.invalidateQueries({ queryKey: ["agenda-all"] });
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
      queryClient.invalidateQueries({ queryKey: ["agenda-all"] });
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

  const statusLabel = (status: string) => {
    switch (status) {
      case "confirmado": return "Agendado";
      case "cancelado": return "Cancelado";
      case "concluido": return "Concluído";
      default: return status;
    }
  };

  // Dates that have appointments (for calendar dots)
  const datesWithAppointments = useMemo(() => {
    const set = new Set<string>();
    allAgendamentos.forEach((a: any) => set.add(a.data));
    return set;
  }, [allAgendamentos]);

  const renderCard = (a: any) => (
    <Card key={a.id} className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold truncate">{a.cliente_nome || "Cliente"}</p>
            <p className="text-sm text-muted-foreground">{(a as any).servicos?.nome_servico}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(a.data + "T00:00:00"), "dd/MM")} • {a.horario?.slice(0, 5)}
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
              {statusLabel(a.status)}
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-2xl font-bold">Agenda</h1>
        <ManualBookingDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["agenda-all"] })} />
      </div>

      {/* Calendar */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { if (d) { setSelectedDate(d); setViewMode("day"); } }}
            locale={ptBR}
            className="mx-auto"
            modifiers={{ hasAppointment: (date) => datesWithAppointments.has(format(date, "yyyy-MM-dd")) }}
            modifiersClassNames={{ hasAppointment: "font-bold text-primary" }}
          />
        </CardContent>
      </Card>

      {/* Control buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={viewMode === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => { setSelectedDate(new Date()); setViewMode("day"); }}
        >
          <CalendarIcon className="h-4 w-4 mr-1" /> Hoje
        </Button>
        <Button
          variant={viewMode === "history" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("history")}
        >
          <History className="h-4 w-4 mr-1" /> Ver Histórico
        </Button>
      </div>

      {/* Day View */}
      {viewMode === "day" && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">
            {isSameDay(selectedDate, new Date()) ? "Hoje" : format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h2>
          {dayAgendamentos.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum agendamento para esta data.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">{dayAgendamentos.map(renderCard)}</div>
          )}
        </div>
      )}

      {/* History View */}
      {viewMode === "history" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Histórico</h2>
            <Select value={historyFilter} onValueChange={(v) => setHistoryFilter(v as HistoryFilter)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <Filter className="h-3.5 w-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="all">Tudo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {historyAgendamentos.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <History className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum agendamento no período selecionado.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">{historyAgendamentos.map(renderCard)}</div>
          )}
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
