import { Calendar, CheckCircle, Users, ArrowRight, Zap, Shield, Bell, Clock, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
  { icon: Star, title: "Lista de espera", desc: "Capture clientes mesmo quando sua agenda está cheia." },
  { icon: Users, title: "Gestão de clientes", desc: "Histórico completo de todos os atendimentos." },
];

const plans = [
  {
    name: "Básico",
    price: "29",
    features: ["Até 50 agendamentos/mês", "1 serviço", "Link de agendamento", "Lembretes por email"],
    popular: false,
  },
  {
    name: "Profissional",
    price: "59",
    features: ["Agendamentos ilimitados", "Serviços ilimitados", "Calendário avançado", "Lista de espera", "Estatísticas", "Programa de indicação"],
    popular: true,
  },
  {
    name: "Premium",
    price: "99",
    features: ["Tudo do Profissional", "Múltiplas agendas", "API personalizada", "Suporte prioritário", "Domínio personalizado"],
    popular: false,
  },
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
          <div className="flex items-center gap-3">
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
              7 dias grátis para testar
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Sua agenda trabalhando{" "}
              <span className="text-gradient">por você.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Automatize seus agendamentos, reduza faltas de clientes e organize sua agenda automaticamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/cadastro">
                  Criar conta grátis
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/cadastro">Testar grátis</Link>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Como funciona?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Comece a receber agendamentos em 3 passos simples.
            </p>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ferramentas feitas para profissionais que valorizam seu tempo.
            </p>
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

      {/* Plans */}
      <section id="planos" className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Planos simples e transparentes
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Comece grátis por 7 dias. Escolha o plano ideal depois.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border transition-all ${
                  plan.popular
                    ? "border-primary shadow-glow bg-card scale-105 relative"
                    : "bg-card shadow-card"
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
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  asChild
                >
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
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded gradient-primary flex items-center justify-center">
              <Calendar className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm">AGENDIFY</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Agendify. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
