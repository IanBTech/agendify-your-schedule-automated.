import {
  Calendar, CheckCircle, Users, ArrowRight, Zap, Shield, Bell, Clock, Star,
  ChevronRight, Play, Briefcase, Scissors, Heart, GraduationCap, Camera, Quote,
  Link2, UserPlus, CalendarClock, History, Ban, Moon, UserCheck, MessageSquare,
  Share2, Mail, Building2, UserCog, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const steps = [
  { number: "01", title: "Crie sua agenda", description: "Configure seus serviços, horários e dias disponíveis.", icon: Calendar },
  { number: "02", title: "Compartilhe seu link", description: "Envie seu link personalizado para seus clientes.", icon: Link2 },
  { number: "03", title: "Clientes agendam automaticamente", description: "Receba agendamentos 24h, sem precisar atender ligações.", icon: CalendarClock },
];

const features = [
  { icon: Link2, title: "Links de agendamento online", desc: "Cada profissional recebe um link exclusivo para receber agendamentos." },
  { icon: UserPlus, title: "Criação manual de agendamentos", desc: "Adicione atendimentos manualmente direto pelo painel." },
  { icon: History, title: "Histórico de atendimentos", desc: "Consulte o histórico completo de todos os agendamentos realizados." },
  { icon: Ban, title: "Bloqueio de horários", desc: "Bloqueie horários específicos, dias inteiros ou períodos de férias." },
  { icon: Moon, title: "Horários de descanso recorrentes", desc: "Configure intervalos fixos para almoço ou pausas regulares." },
  { icon: Calendar, title: "Bloqueio de dias e férias", desc: "Bloqueie dias completos ou períodos de viagem e descanso." },
  { icon: UserCheck, title: "Gestão de clientes", desc: "Cadastre e gerencie seus clientes com histórico de atendimentos." },
  { icon: MessageSquare, title: "Sistema de feedback", desc: "Receba avaliações dos seus clientes e melhore continuamente." },
  { icon: Share2, title: "Programa de indicação", desc: "Ganhe benefícios indicando outros profissionais para a plataforma." },
  { icon: Mail, title: "Notificações por email e WhatsApp", desc: "Lembretes automáticos para reduzir faltas e cancelamentos." },
];

const individualFeatures = [
  "Link pessoal de agendamento",
  "Gestão simples da agenda",
  "Notificações para clientes",
  "Histórico de atendimentos",
];

const audiences = [
  { icon: Scissors, label: "Barbeiros" },
  { icon: Heart, label: "Psicólogos" },
  { icon: Users, label: "Personal Trainers" },
  { icon: GraduationCap, label: "Professores" },
  { icon: Briefcase, label: "Freelancers" },
  { icon: Camera, label: "Consultores" },
];

const companyFeatures = [
  "Múltiplos funcionários",
  "Agendas separadas por profissional",
  "Painel administrativo da empresa",
  "Gestão de agendamentos da equipe",
  "Agendamento centralizado de clientes",
];

const plans = [
  {
    name: "Individual",
    price: "49",
    subtitle: "Para profissionais autônomos",
    features: ["1 profissional", "1 agenda", "1 link de agendamento", "Agendamentos ilimitados", "Lembretes por email", "QR code"],
    popular: false,
  },
  {
    name: "Empresa",
    price: "99",
    subtitle: "Para equipes e negócios",
    features: ["Múltiplos funcionários", "Agendas separadas", "Painel admin da empresa", "Relatórios avançados", "Suporte prioritário", "Gestão de equipe"],
    popular: true,
  },
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
          <div className="hidden lg:flex items-center gap-6">
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</a>
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#profissionais" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Para Profissionais</a>
            <a href="#empresas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Para Empresas</a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/cadastro">Criar conta</Link>
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
              Agendamento inteligente{" "}
              <span className="text-gradient">para profissionais e equipes.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Deixe seus clientes agendar online enquanto você gerencia toda sua agenda em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/cadastro">
                  Criar conta grátis
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <a href="#como-funciona">
                  <Play className="h-4 w-4" />
                  Veja como funciona
                </a>
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
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-glow mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="font-mono text-primary font-semibold tracking-widest text-2xl">PASSO {step.number}</span>
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
            <p className="text-muted-foreground max-w-md mx-auto">Ferramentas completas para gerenciar sua agenda profissional.</p>
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

      {/* For Professionals */}
      <section id="profissionais" className="py-20 bg-muted/50">
        <div className="container">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Para profissionais autônomos</h2>
              <p className="text-muted-foreground mb-8">
                O Agendify é ideal para qualquer profissional que atende por horário. Simplifique sua rotina e deixe a tecnologia trabalhar por você.
              </p>
              <ul className="space-y-3 mb-8">
                {individualFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="hero" asChild>
                <Link to="/cadastro">Começar como profissional <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        </div>
      </section>

      {/* For Companies */}
      <section id="empresas" className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 rounded-xl border bg-card shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-display font-semibold">Página da empresa</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Clientes acessam <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/book/nome-empresa</code> e escolhem com qual profissional desejam agendar.</p>
                </div>
                <div className="p-6 rounded-xl border bg-card shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-display font-semibold">Painel administrativo</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Visualize todos os calendários, gerencie a equipe e controle os agendamentos da empresa em um só lugar.</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Para empresas e equipes</h2>
              <p className="text-muted-foreground mb-8">
                Gerencie toda a sua equipe em uma única plataforma. Cada funcionário tem sua própria agenda e os clientes escolhem com quem agendar.
              </p>
              <ul className="space-y-3 mb-8">
                {companyFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="hero" asChild>
                <Link to="/cadastro">Começar como empresa <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Booking System Explanation */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Seu link personalizado de agendamento</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Cada profissional recebe um link exclusivo que pode ser compartilhado com clientes. Empresas também recebem uma página onde o cliente escolhe o profissional.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-6 rounded-xl border bg-card shadow-card text-left">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-display font-semibold mb-2">Link individual</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded block mb-2">/book/joao</code>
                <p className="text-sm text-muted-foreground">O cliente acessa direto a agenda do profissional.</p>
              </div>
              <div className="p-6 rounded-xl border bg-card shadow-card text-left">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-display font-semibold mb-2">Link da empresa</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded block mb-2">/book/nome-empresa</code>
                <p className="text-sm text-muted-foreground">O cliente escolhe o profissional antes de agendar.</p>
              </div>
            </div>
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
                <h3 className="font-display text-lg font-semibold mb-0.5">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.subtitle}</p>
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
                <div className="flex gap-2">
                  <Button variant={plan.popular ? "hero" : "outline"} className="flex-1" asChild>
                    <Link to="/cadastro">Começar grátis</Link>
                  </Button>
                </div>
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
              Comece a automatizar sua agenda hoje.
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Junte-se a milhares de profissionais que já usam o AGENDIFY.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="dark-outline" size="lg" asChild>
                <Link to="/cadastro">
                  Criar conta grátis
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="dark-outline" size="lg" asChild>
                <a href="#planos">Ver planos</a>
              </Button>
            </div>
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
              <p className="text-xs text-muted-foreground">A plataforma de agendamento para profissionais e equipes.</p>
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
