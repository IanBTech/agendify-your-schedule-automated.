import { useState } from "react";
import { Ban, CalendarOff, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

type BlockType = "horario" | "dia" | "periodo";

interface Props {
  onSuccess: () => void;
}

export default function BlockTimeDialog({ onSuccess }: Props) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [blockType, setBlockType] = useState<BlockType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nota, setNota] = useState("");

  const reset = () => {
    setBlockType(null);
    setDate("");
    setStartTime("");
    setEndTime("");
    setStartDate("");
    setEndDate("");
    setNota("");
  };

  const handleSubmit = async () => {
    if (!profile || !blockType) return;
    setSubmitting(true);

    let insertData: any = {
      profissional_id: profile.id,
      tipo: blockType,
      nota: nota || null,
    };

    if (blockType === "horario") {
      if (!date || !startTime || !endTime) {
        toast.error("Preencha data e horários.");
        setSubmitting(false);
        return;
      }
      insertData.data_inicio = date;
      insertData.horario_inicio = startTime;
      insertData.horario_fim = endTime;
    } else if (blockType === "dia") {
      if (!date) {
        toast.error("Preencha a data.");
        setSubmitting(false);
        return;
      }
      insertData.data_inicio = date;
    } else if (blockType === "periodo") {
      if (!startDate || !endDate) {
        toast.error("Preencha as datas de início e fim.");
        setSubmitting(false);
        return;
      }
      insertData.data_inicio = startDate;
      insertData.data_fim = endDate;
    }

    const { error } = await supabase.from("bloqueios" as any).insert(insertData);
    setSubmitting(false);

    if (error) {
      toast.error("Erro ao bloquear horário.");
    } else {
      toast.success("Horário bloqueado com sucesso!");
      reset();
      setOpen(false);
      onSuccess();
    }
  };

  const typeOptions = [
    { type: "horario" as BlockType, icon: Ban, label: "Horário específico", desc: "Bloquear um intervalo de horas" },
    { type: "dia" as BlockType, icon: CalendarOff, label: "Dia inteiro", desc: "Bloquear um dia completo" },
    { type: "periodo" as BlockType, icon: Plane, label: "Período", desc: "Bloquear vários dias (férias, viagem)" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Ban className="h-4 w-4 mr-1" /> Bloquear Horário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bloquear Horário</DialogTitle>
        </DialogHeader>

        {!blockType ? (
          <div className="space-y-3">
            {typeOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setBlockType(opt.type)}
                className="w-full flex items-center gap-3 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <opt.icon className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-sm text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setBlockType(null)}>
              ← Voltar
            </Button>

            {blockType === "horario" && (
              <>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Início</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim</Label>
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {blockType === "dia" && (
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            )}

            {blockType === "periodo" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data início</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data fim</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Nota (opcional)</Label>
              <Textarea
                placeholder="Ex: reunião, férias, compromisso pessoal"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={2}
              />
            </div>

            <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Salvando..." : "Confirmar bloqueio"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
