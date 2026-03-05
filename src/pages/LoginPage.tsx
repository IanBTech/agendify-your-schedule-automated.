import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
            <Calendar className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-surface-dark-foreground mb-4">
            Sua agenda trabalhando por você.
          </h2>
          <p className="text-surface-dark-foreground/60">
            Automatize agendamentos e foque no que importa: seus clientes.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">AGENDIFY</span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">Entrar</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Acesse seu painel e gerencie sua agenda.
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button variant="hero" className="w-full" type="submit">
              Entrar
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
