import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface DiaConfig {
  ativo: boolean;
  inicio: string;
  fim: string;
  dbId?: string;
}

export default function DisponibilidadePage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: dbDisponibilidade } = useQuery({
    queryKey: ["disponibilidade", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("disponibilidade")
        .select("*")
        .eq("profissional_id", profile!.id);
      return data ?? [];
    },
  });

  const [dias, setDias] = useState<Record<string, DiaConfig>>(
    Object.fromEntries(diasSemana.map((d, i) => [d, { ativo: i !== 0, inicio: "08:00", fim: "18:00" }]))
  );

  useEffect(() => {
    if (dbDisponibilidade && dbDisponibilidade.length > 0) {
      const newDias = { ...dias };
      dbDisponibilidade.forEach((d) => {
        const diaName = diasSemana[d.dia_semana];
        newDias[diaName] = {
          ativo: d.ativo,
          inicio: d.horario_inicio.slice(0, 5),
          fim: d.horario_fim.slice(0, 5),
          dbId: d.id,
        };
      });
      setDias(newDias);
    }
  }, [dbDisponibilidade]);

  const toggleDia = (dia: string) => {
    setDias({ ...dias, [dia]: { ...dias[dia], ativo: !dias[dia].ativo } });
  };

  const updateHorario = (dia: string, field: "inicio" | "fim", value: string) => {
    setDias({ ...dias, [dia]: { ...dias[dia], [field]: value } });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete existing
      await supabase.from("disponibilidade").delete().eq("profissional_id", profile!.id);
      // Insert all
      const rows = diasSemana.map((dia, i) => ({
        profissional_id: profile!.id,
        dia_semana: i,
        horario_inicio: dias[dia].inicio,
        horario_fim: dias[dia].fim,
        ativo: dias[dia].ativo,
      }));
      const { error } = await supabase.from("disponibilidade").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disponibilidade"] });
      toast.success("Disponibilidade salva!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Disponibilidade</h1>
      <p className="text-sm text-muted-foreground">Defina seus horários de atendimento por dia da semana.</p>

      <div className="space-y-3">
        {diasSemana.map((dia) => (
          <Card key={dia} className={`shadow-card transition-opacity ${!dias[dia].ativo ? "opacity-50" : ""}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <Switch checked={dias[dia].ativo} onCheckedChange={() => toggleDia(dia)} />
              <span className="font-medium w-20 text-sm">{dia}</span>
              {dias[dia].ativo ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input type="time" value={dias[dia].inicio} onChange={(e) => updateHorario(dia, "inicio", e.target.value)} className="w-28" />
                  <span className="text-muted-foreground text-sm">às</span>
                  <Input type="time" value={dias[dia].fim} onChange={(e) => updateHorario(dia, "fim", e.target.value)} className="w-28" />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Indisponível</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="hero" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
        {saveMutation.isPending ? "Salvando..." : "Salvar disponibilidade"}
      </Button>
    </div>
  );
}
