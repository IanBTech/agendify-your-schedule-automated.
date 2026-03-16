import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Calendar, CheckCircle, Clock, ArrowLeft, ArrowRight, Loader2, User } from "lucide-react";
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

interface OrgData {
  id: string;
  nome: string;
  members: ProfissionalData[];
}

export default function BookingPage() {
  const { slug } = useParams();
  const [profissional, setProfissional] = useState<ProfissionalData | null>(null);
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [servicos, setServicos] = useState<any[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bloqueios, setBloqueios] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [step, setStep] = useState(0); // 0 = choose professional (company only), 1-4 = booking steps
  const [selectedServico, setSelectedServico] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHorario, setSelectedHorario] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    // First try to find a profile with this slug
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, nome, nome_negocio, profissao, descricao_negocio")
      .eq("slug", slug!)
      .single();

    if (prof) {
      setProfissional(prof as any);
      await loadProfissionalData(prof.id);
      setStep(1);
      setLoading(false);
      return;
    }

    // Try organization slug
    const { data: org } = await supabase
      .from("organizations")
      .select("id, nome, slug")
      .eq("slug", slug!)
      .single();

    if (org) {
      // Load org members
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", org.id);

      if (members && members.length > 0) {
        const userIds = members.map((m: any) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nome, nome_negocio, profissao, descricao_negocio")
          .in("user_id", userIds);

        setOrgData({
          id: org.id,
          nome: org.nome,
          members: (profiles || []) as ProfissionalData[],
        });
        setStep(0);
      }
      setLoading(false);
      return;
    }

    setNotFound(true);
    setLoading(false);
  };

  const loadProfissionalData = async (profId: string) => {
    const [{ data: srvs }, { data: disp }, { data: blocks }] = await Promise.all([
      supabase.from("servicos").select("*").eq("profissional_id", profId).eq("ativo", true),
      supabase.from("disponibilidade").select("*").eq("profissional_id", profId).eq("ativo", true),
      supabase.from("bloqueios" as any).select("*").eq("profissional_id", profId),
    ]);
    setServicos(srvs ?? []);
    setDisponibilidade(disp ?? []);
    setBloqueios(blocks ?? []);
  };

  const selectProfessional = async (prof: ProfissionalData) => {
    setProfissional(prof);
    await loadProfissionalData(prof.id);
    setStep(1);
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

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const timeBlocks = bloqueios.filter((b: any) => b.tipo === "horario" && b.data_inicio === dateStr);

    for (let m = startMin; m + duration <= endMin; m += duration) {
      const h = Math.floor(m / 60).toString().padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      const timeStr = `${h}:${min}`;
      if (bookedSlots.includes(timeStr)) continue;
      const slotMin = m;
      const slotEnd = m + duration;
      const isBlocked = timeBlocks.some((b: any) => {
        const [bsH, bsM] = (b.horario_inicio || "00:00").split(":").map(Number);
        const [beH, beM] = (b.horario_fim || "23:59").split(":").map(Number);
        const blockStart = bsH * 60 + bsM;
        const blockEnd = beH * 60 + beM;
        return slotMin < blockEnd && slotEnd > blockStart;
      });
      if (!isBlocked) {
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

  if (notFound) {
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
        <p className="text-sm text-muted-foreground mt-4">com {profissional?.nome}</p>
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
            <h1 className="font-display font-bold">
              {orgData ? orgData.nome : (profissional?.nome_negocio || profissional?.nome)}
            </h1>
            {!orgData && profissional?.profissao && (
              <p className="text-xs text-muted-foreground">{profissional.profissao}</p>
            )}
          </div>
        </div>
      </header>

      <div className="container max-w-lg py-8 space-y-6">
        {/* Progress bar */}
        {step > 0 && (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "gradient-primary" : "bg-muted"}`} />
            ))}
          </div>
        )}

        {/* Step 0: Choose professional (company only) */}
        {step === 0 && orgData && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Escolha um profissional</h2>
            <div className="space-y-3">
              {orgData.members.map((member) => (
                <Card
                  key={member.id}
                  className="shadow-card cursor-pointer transition-all hover:border-primary"
                  onClick={() => selectProfessional(member)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{member.nome}</p>
                      {member.profissao && (
                        <p className="text-sm text-muted-foreground">{member.profissao}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {orgData && (
              <Button variant="ghost" size="sm" onClick={() => { setStep(0); setProfissional(null); setSelectedServico(null); }}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Trocar profissional
              </Button>
            )}
            <h2 className="font-display text-xl font-bold">Escolha o serviço</h2>
            {profissional && orgData && (
              <p className="text-sm text-muted-foreground">Profissional: <strong>{profissional.nome}</strong></p>
            )}
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
                {profissional && <p className="text-muted-foreground">com {profissional.nome}</p>}
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
