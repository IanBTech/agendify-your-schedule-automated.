import { useState } from "react";
import { Calendar, CheckCircle, Clock, ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const demoServicos = [
  { id: "1", nome_servico: "Corte de Cabelo", duracao_minutos: 30, preco: "R$ 45,00" },
  { id: "2", nome_servico: "Barba", duracao_minutos: 20, preco: "R$ 25,00" },
  { id: "3", nome_servico: "Corte + Barba", duracao_minutos: 50, preco: "R$ 60,00" },
];

const demoTimeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

function getDemoDates() {
  const today = startOfDay(new Date());
  const dates: Date[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = addDays(today, i);
    if (d.getDay() !== 0) dates.push(d); // skip Sunday
  }
  return dates;
}

export default function DemoPage() {
  const [step, setStep] = useState(1);
  const [selectedServico, setSelectedServico] = useState<typeof demoServicos[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHorario, setSelectedHorario] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [success, setSuccess] = useState(false);

  const dates = getDemoDates();

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Agendamento simulado!</h1>
        <p className="text-muted-foreground mb-1">{selectedServico?.nome_servico}</p>
        <p className="text-muted-foreground">
          {selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedHorario}
        </p>
        <p className="text-sm text-muted-foreground mt-4">com Barbearia Demo</p>
        <p className="text-xs text-muted-foreground mt-6 max-w-sm">
          Este é apenas um modo demonstração. Nenhum agendamento real foi criado.
        </p>
        <div className="flex gap-3 mt-8">
          <Button variant="hero" asChild>
            <Link to="/cadastro">Criar minha conta</Link>
          </Button>
          <Button variant="outline" onClick={() => { setSuccess(false); setStep(1); setSelectedServico(null); setSelectedDate(null); setSelectedHorario(""); setClienteNome(""); }}>
            Testar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold">Barbearia Demo</h1>
              <p className="text-xs text-muted-foreground">Barbeiro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Play className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Modo demonstração</span>
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
              {demoServicos.map((s) => (
                <Card
                  key={s.id}
                  className={`shadow-card cursor-pointer transition-all hover:border-primary ${selectedServico?.id === s.id ? "border-primary ring-2 ring-primary/20" : ""}`}
                  onClick={() => setSelectedServico(s)}
                >
                  <CardContent className="p-4">
                    <p className="font-semibold">{s.nome_servico}</p>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />{s.duracao_minutos} min • {s.preco}
                    </p>
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
              {dates.slice(0, 12).map((d) => (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedDate && d.toDateString() === selectedDate.toDateString() ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "hover:border-primary/50"
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
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {demoTimeSlots.map((t) => (
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
                <Input placeholder="Seu nome" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" disabled />
              </div>
            </div>
            <Button variant="hero" className="w-full" onClick={() => setSuccess(true)} disabled={!clienteNome}>
              Confirmar agendamento (demo)
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          🎮 Modo demonstração — nenhum dado real é salvo.{" "}
          <Link to="/cadastro" className="text-primary hover:underline">Criar conta real</Link>
        </p>
      </div>
    </div>
  );
}
