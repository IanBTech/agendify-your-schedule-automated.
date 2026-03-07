import { Calendar, CheckCircle, Users, ArrowRight, Zap, Shield, Bell, Clock, Star, ChevronRight, Play, Briefcase, Scissors, Heart, GraduationCap, Camera, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const steps = [
  { number: "01", title: "Crie sua conta", description: "Cadastre-se gratuitamente em menos de 1 minuto.", icon: Users },
  { number: "02", title: "Configure sua agenda", description: "Adicione seus serviços e horários disponíveis.", icon: Calendar },
  { number: "03", title: "Compartilhe seu link", description: "Envie para seus clientes e receba agendamentos.", icon: ArrowRight },
];

const features = [
  { icon: Zap, title: "Agendamento automático", desc: "Seus clientes agendam sozinhos, 24h por dia." },
  { icon: Bell, title: "Lembretes automáticos", desc: "Reduza faltas com lembretes por email." },
  { icon: Shield, title: "Sem conflitos", desc: "O sistema impede agendamentos duplicados." },
  { icon: Clock, title: "Disponibilidade flexível", desc: "Configure horários diferentes por dia da semana." },
  { icon: Star, title: "QR Code & Link", desc: "Compartilhe seu link de agendamento com QR Code." },
  { icon: Users, title: "Gestão de clientes", desc: "Histórico completo de todos os atendimentos." },
];

const plans = [
  {
    name: "Solo",
    price: "49",
    features: ["1 profissional", "Agendamentos ilimitados", "QR code", "Página de agendamento", "Lembretes por email"],
    popular: false,
  },
  {
    name: "Empresa",
    price: "99",
    features: ["Múltiplos profissionais", "Múltiplos calendários", "Gestão de equipe", "Relatórios avançados", "Suporte prioritário"],
    popular: true,
  },
];

const audiences = [
  { icon: Scissors, label: "Barbeiros & Salões" },
  { icon: Heart, label: "Estética & Beleza" },
  { icon: Briefcase, label: "Consultores" },
  { icon: GraduationCap, label: "Professores" },
  { icon: Camera, label: "Fotógrafos" },
  { icon: Users, label: "Personal Trainers" },
];

const testimonials = [
  { name: "Ana Silva", role: "Nail Designer", text: "O Agendify transformou minha rotina. Antes eu perdia horas organizando a agenda pelo WhatsApp." },
  { name: "Carlos Mendes", role: "Barbeiro", text: "Meus clientes adoram poder agendar sozinhos. Reduzi as faltas em 40% com os lembretes." },
  { name: "Marina Costa", role: "Personal Trainer", text: "Interface limpa e fácil de usar. Em 5 minutos já estava recebendo agendamentos." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">AGENDIFY</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/cadastro">Testar grátis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(258,90%,60%,0.08),transparent_60%)]" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-up">
              <Zap className="h-3.5 w-3.5" />
              14 dias grátis para testar
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Organize sua agenda.{" "}
              <span className="text-gradient">Cresça seu negócio.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              A forma mais fácil para profissionais gerenciarem agendamentos automaticamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/cadastro">
                  Começar teste grátis
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/demo">
                  <Play className="h-4 w-4" />
                  Testar sem cadastro
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              Sem cartão de crédito. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Como funciona?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Comece a receber agendamentos em 3 passos simples.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center group">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-glow mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="text-xs font-mono text-primary font-semibold tracking-widest">PASSO {step.number}</span>
                <h3 className="font-display text-xl font-semibold mt-2 mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Ferramentas feitas para profissionais que valorizam seu tempo.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border bg-card shadow-card hover:shadow-glow/20 transition-all hover:-translate-y-1 group">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Para quem é o Agendify?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Ideal para qualquer profissional que atende por horário.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {audiences.map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-3 p-4 rounded-xl border bg-card shadow-card text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <a.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">O que dizem nossos clientes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-xl border bg-card shadow-card">
                <Quote className="h-6 w-6 text-primary/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">{t.text}</p>
                <div>
                  <p className="font-display font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Planos simples e transparentes</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Comece grátis por 14 dias. Escolha o plano ideal depois.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border transition-all ${
                  plan.popular ? "border-primary shadow-glow bg-card scale-105 relative" : "bg-card shadow-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold">
                    Mais popular
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "hero" : "outline"} className="w-full" asChild>
                  <Link to="/cadastro">Começar agora</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center rounded-3xl gradient-primary p-12 shadow-glow">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Pronto para automatizar sua agenda?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Junte-se a milhares de profissionais que já usam o AGENDIFY.
            </p>
            <Button variant="dark-outline" size="lg" asChild>
              <Link to="/cadastro">
                Criar conta grátis
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded gradient-primary flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-sm">AGENDIFY</span>
              </div>
              <p className="text-xs text-muted-foreground">A plataforma de agendamento para profissionais.</p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">Produto</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-foreground transition-colors">Planos</a></li>
                <li><Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">Conta</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground transition-colors">Entrar</Link></li>
                <li><Link to="/cadastro" className="hover:text-foreground transition-colors">Criar conta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><span className="cursor-default">Termos de uso</span></li>
                <li><span className="cursor-default">Política de privacidade</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 text-center">
            <p className="text-xs text-muted-foreground">© 2026 Agendify. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
