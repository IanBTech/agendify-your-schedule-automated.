import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const profissoes = [
  "Cabeleireiro(a)", "Barbeiro(a)", "Manicure", "Esteticista", "Massagista",
  "Personal Trainer", "Tatuador(a)", "Professor(a) Particular", "Terapeuta",
  "Consultor(a)", "Outro",
];

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [profissao, setProfissao] = useState("");
  const [tipoConta, setTipoConta] = useState<"individual" | "empresa">("individual");
  const [codigoIndicacao, setCodigoIndicacao] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profissao) { toast.error("Selecione sua profissão"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, profissao, tipo_conta: tipoConta, codigo_indicacao_usado: codigoIndicacao || undefined },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada! Verifique seu email para confirmar.");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-dark items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
            <Calendar className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-surface-dark-foreground mb-4">
            Comece grátis por 7 dias
          </h2>
          <p className="text-surface-dark-foreground/60">
            Sem cartão de crédito. Configure em minutos.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">AGENDIFY</span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">Criar conta</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Preencha os dados e comece seu teste grátis.
          </p>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profissao">Profissão</Label>
              <select
                id="profissao"
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Selecione sua profissão</option>
                {profissoes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de conta</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoConta("individual")}
                  className={`p-3 rounded-lg border text-center text-sm font-medium transition-all ${
                    tipoConta === "individual"
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "hover:border-primary/50"
                  }`}
                >
                  👤 Profissional Individual
                </button>
                <button
                  type="button"
                  onClick={() => setTipoConta("empresa")}
                  className={`p-3 rounded-lg border text-center text-sm font-medium transition-all ${
                    tipoConta === "empresa"
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "hover:border-primary/50"
                  }`}
                >
                  🏢 Empresa / Equipe
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoIndicacao">Código de indicação (opcional)</Label>
              <Input
                id="codigoIndicacao"
                placeholder="Ex: AGDFY-ABC123"
                value={codigoIndicacao}
                onChange={(e) => setCodigoIndicacao(e.target.value.toUpperCase())}
              />
            </div>
            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
