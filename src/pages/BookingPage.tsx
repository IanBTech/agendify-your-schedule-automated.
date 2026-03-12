import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Calendar, CheckCircle, Clock, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfissionalData {
  id: string;
  nome: string;
  nome_negocio: string | null;
  profissao: string | null;
  descricao_negocio: string | null;
}

export default function BookingPage() {
  const { slug } = useParams();
  const [profissional, setProfissional] = useState<ProfissionalData | null>(null);
  const [servicos, setServicos] = useState<any[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bloqueios, setBloqueios] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedServico, setSelectedServico] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHorario, setSelectedHorario] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfissional();
  }, [slug]);

  const loadProfissional = async () => {
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, nome, nome_negocio, profissao, descricao_negocio")
      .eq("slug", slug!)
      .single();

    if (!prof) { setLoading(false); return; }
    setProfissional(prof as any);

    const [{ data: srvs }, { data: disp }, { data: blocks }] = await Promise.all([
      supabase.from("servicos").select("*").eq("profissional_id", prof.id).eq("ativo", true),
      supabase.from("disponibilidade").select("*").eq("profissional_id", prof.id).eq("ativo", true),
      supabase.from("bloqueios" as any).select("*").eq("profissional_id", prof.id),
    ]);
    setServicos(srvs ?? []);
    setDisponibilidade(disp ?? []);
    setBloqueios(blocks ?? []);
    setLoading(false);
  };

  const loadBookedSlots = useCallback(async (date: Date) => {
    if (!profissional) return;
    setLoadingSlots(true);
    const dateStr = format(date, "yyyy-MM-dd");
    const { data } = await supabase
      .from("agendamentos")
      .select("horario")
      .eq("profissional_id", profissional.id)
      .eq("data", dateStr)
      .neq("status", "cancelado");
    setBookedSlots((data ?? []).map((a: any) => a.horario?.slice(0, 5)));
    setLoadingSlots(false);
  }, [profissional]);

  const isDateBlocked = (dateStr: string) => {
    return bloqueios.some((b: any) => {
      if (b.tipo === "dia" && b.data_inicio === dateStr) return true;
      if (b.tipo === "periodo" && b.data_inicio <= dateStr && (b.data_fim ?? b.data_inicio) >= dateStr) return true;
      return false;
    });
  };

  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    for (let i = 1; i <= 30; i++) {
      const d = addDays(today, i);
      const dayOfWeek = d.getDay();
      const dateStr = format(d, "yyyy-MM-dd");
      if (isDateBlocked(dateStr)) continue;
      if (disponibilidade.some((disp: any) => disp.dia_semana === dayOfWeek && disp.ativo)) {
        dates.push(d);
      }
    }
    return dates;
  };

  const getTimeSlots = () => {
    if (!selectedDate || !selectedServico) return [];
    const dayOfWeek = selectedDate.getDay();
    const dayDisp = disponibilidade.find((d: any) => d.dia_semana === dayOfWeek);
    if (!dayDisp) return [];

    const slots: string[] = [];
    const [startH, startM] = dayDisp.horario_inicio.split(":").map(Number);
    const [endH, endM] = dayDisp.horario_fim.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const duration = selectedServico.duracao_minutos;

    for (let m = startMin; m + duration <= endMin; m += duration) {
      const h = Math.floor(m / 60).toString().padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      const timeStr = `${h}:${min}`;
      // Filter out already booked slots
      if (!bookedSlots.includes(timeStr)) {
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const handleSelectDate = async (date: Date) => {
    setSelectedDate(date);
    setSelectedHorario("");
    await loadBookedSlots(date);
  };

  const handleSubmit = async () => {
    if (!profissional || !selectedServico || !selectedDate || !selectedHorario || !clienteNome) return;
    setSubmitting(true);
    const { error } = await supabase.from("agendamentos").insert({
      profissional_id: profissional.id,
      servico_id: selectedServico.id,
      data: format(selectedDate, "yyyy-MM-dd"),
      horario: selectedHorario,
      cliente_nome: clienteNome,
      cliente_telefone: clienteTelefone || null,
      cliente_email: clienteEmail || null,
      status: "confirmado",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao agendar. Tente novamente.");
    } else {
      setSuccess(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profissional) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <Calendar className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground">Este link de agendamento não existe.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Agendamento confirmado!</h1>
        <p className="text-muted-foreground mb-1">{selectedServico?.nome_servico}</p>
        <p className="text-muted-foreground">
          {selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedHorario}
        </p>
        <p className="text-sm text-muted-foreground mt-4">com {profissional.nome}</p>
      </div>
    );
  }

  const availableDates = getAvailableDates();
  const timeSlots = getTimeSlots();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold">{profissional.nome_negocio || profissional.nome}</h1>
            {profissional.profissao && <p className="text-xs text-muted-foreground">{profissional.profissao}</p>}
          </div>
        </div>
      </header>

      <div className="container max-w-lg py-8 space-y-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "gradient-primary" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Escolha o serviço</h2>
            <div className="space-y-3">
              {servicos.map((s) => (
                <Card
                  key={s.id}
                  className={`shadow-card cursor-pointer transition-all hover:border-primary ${selectedServico?.id === s.id ? "border-primary ring-2 ring-primary/20" : ""}`}
                  onClick={() => setSelectedServico(s)}
                >
                  <CardContent className="p-4">
                    <p className="font-semibold">{s.nome_servico}</p>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />{s.duracao_minutos} min
                      {s.preco && ` • R$ ${s.preco}`}
                    </p>
                    {s.descricao && <p className="text-xs text-muted-foreground mt-1">{s.descricao}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedServico && (
              <Button variant="hero" className="w-full" onClick={() => setStep(2)}>
                Continuar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>
            <h2 className="font-display text-xl font-bold">Escolha a data</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableDates.slice(0, 16).map((d) => (
                <button
                  key={d.toISOString()}
                  onClick={() => handleSelectDate(d)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedDate && isSameDay(d, selectedDate) ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "hover:border-primary/50"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">{format(d, "EEE", { locale: ptBR })}</p>
                  <p className="font-bold">{format(d, "dd")}</p>
                  <p className="text-xs text-muted-foreground">{format(d, "MMM", { locale: ptBR })}</p>
                </button>
              ))}
            </div>
            {selectedDate && (
              <Button variant="hero" className="w-full" onClick={() => setStep(3)}>
                Continuar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>
            <h2 className="font-display text-xl font-bold">Escolha o horário</h2>
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : timeSlots.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum horário disponível nesta data.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedHorario(t)}
                    className={`p-3 rounded-lg border text-center font-medium transition-all ${
                      selectedHorario === t ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "hover:border-primary/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {selectedHorario && (
              <Button variant="hero" className="w-full" onClick={() => setStep(4)}>
                Continuar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>
            <h2 className="font-display text-xl font-bold">Seus dados</h2>

            <Card className="shadow-card bg-muted/50">
              <CardContent className="p-4 text-sm space-y-1">
                <p><strong>{selectedServico?.nome_servico}</strong></p>
                <p>{selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedHorario}</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input placeholder="Seu nome" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="seu@email.com" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} />
              </div>
            </div>

            <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={!clienteNome || submitting}>
              {submitting ? "Agendando..." : "Confirmar agendamento"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
