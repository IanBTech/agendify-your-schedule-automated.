import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

interface DiaConfig {
  ativo: boolean;
  inicio: string;
  fim: string;
}

export default function DisponibilidadePage() {
  const [dias, setDias] = useState<Record<string, DiaConfig>>(
    Object.fromEntries(diasSemana.map((d) => [d, { ativo: d !== "Domingo", inicio: "08:00", fim: "18:00" }]))
  );

  const toggleDia = (dia: string) => {
    setDias({ ...dias, [dia]: { ...dias[dia], ativo: !dias[dia].ativo } });
  };

  const updateHorario = (dia: string, field: "inicio" | "fim", value: string) => {
    setDias({ ...dias, [dia]: { ...dias[dia], [field]: value } });
  };

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
                  <Input
                    type="time"
                    value={dias[dia].inicio}
                    onChange={(e) => updateHorario(dia, "inicio", e.target.value)}
                    className="w-28"
                  />
                  <span className="text-muted-foreground text-sm">às</span>
                  <Input
                    type="time"
                    value={dias[dia].fim}
                    onChange={(e) => updateHorario(dia, "fim", e.target.value)}
                    className="w-28"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Indisponível</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="hero">Salvar disponibilidade</Button>
    </div>
  );
}
