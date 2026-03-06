import { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarioPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: agendamentos = [] } = useQuery({
    queryKey: ["calendario", profile?.id, format(currentMonth, "yyyy-MM")],
    enabled: !!profile,
    queryFn: async () => {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      const { data } = await supabase
        .from("agendamentos")
        .select("*, servicos(nome_servico)")
        .eq("profissional_id", profile!.id)
        .gte("data", start)
        .lte("data", end)
        .neq("status", "cancelado");
      return data ?? [];
    },
  });

  const { data: disponibilidade = [] } = useQuery({
    queryKey: ["disponibilidade-cal", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("disponibilidade")
        .select("*")
        .eq("profissional_id", profile!.id);
      return data ?? [];
    },
  });

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = getDay(startOfMonth(currentMonth));

  const agendamentosByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    agendamentos.forEach((a: any) => {
      const key = a.data;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [agendamentos]);

  const getDayStatus = (date: Date) => {
    const dayOfWeek = getDay(date);
    const disp = disponibilidade.find((d: any) => d.dia_semana === dayOfWeek && d.ativo);
    if (!disp) return "closed";

    const dateStr = format(date, "yyyy-MM-dd");
    const count = agendamentosByDate[dateStr]?.length ?? 0;

    const [startH, startM] = disp.horario_inicio.split(":").map(Number);
    const [endH, endM] = disp.horario_fim.split(":").map(Number);
    const totalSlots = Math.floor(((endH * 60 + endM) - (startH * 60 + startM)) / 30);

    if (count === 0) return "free";
    if (count >= totalSlots) return "full";
    return "partial";
  };

  const statusColors: Record<string, string> = {
    free: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    partial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    full: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    closed: "bg-muted text-muted-foreground opacity-40",
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedAgendamentos = selectedDate ? agendamentosByDate[selectedDate] ?? [] : [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["calendario"] });
    queryClient.invalidateQueries({ queryKey: ["disponibilidade-cal"] });
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Calendário</h1>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>‹</Button>
          <CardTitle className="text-base font-display capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map((day) => {
              const status = getDayStatus(day);
              const dateStr = format(day, "yyyy-MM-dd");
              const count = agendamentosByDate[dateStr]?.length ?? 0;
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-lg text-sm font-medium flex flex-col items-center justify-center gap-0.5 transition-all ${statusColors[status]} ${
                    selectedDate === dateStr ? "ring-2 ring-primary" : ""
                  } ${isToday(day) ? "ring-1 ring-foreground/20" : ""}`}
                >
                  <span>{format(day, "d")}</span>
                  {count > 0 && <span className="text-[10px]">{count}</span>}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900/50" /> Livre</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-yellow-200 dark:bg-yellow-900/50" /> Parcial</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-red-200 dark:bg-red-900/50" /> Cheio</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-muted" /> Fechado</span>
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display">
              Agendamentos — {format(new Date(selectedDate + "T12:00:00"), "dd/MM/yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAgendamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum agendamento neste dia.</p>
            ) : (
              <div className="space-y-2">
                {selectedAgendamentos.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{a.cliente_nome || "Cliente"}</p>
                      <p className="text-xs text-muted-foreground">{(a as any).servicos?.nome_servico}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{a.horario?.slice(0, 5)}</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        a.status === "confirmado" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
