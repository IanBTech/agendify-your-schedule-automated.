import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InvitationData {
  id: string;
  organization_id: string;
  email: string;
  nome: string;
  status: string;
  org_nome?: string;
}

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    const { data } = await supabase
      .from("invitations" as any)
      .select("id, organization_id, email, nome, status")
      .eq("token", token!)
      .single();

    if (!data) {
      setLoading(false);
      return;
    }

    const inv = data as any;

    // Get org name
    const { data: org } = await supabase
      .from("organizations")
      .select("nome")
      .eq("id", inv.organization_id)
      .single();

    setInvitation({
      ...inv,
      org_nome: org?.nome || "Empresa",
    });
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!invitation) return;
    if (senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password: senha,
      options: {
        data: {
          nome: invitation.nome,
          tipo_conta: "employee",
          organization_id: invitation.organization_id,
        },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setSubmitting(false);
      return;
    }

    if (authData.user) {
      // Update invitation status
      await supabase
        .from("invitations" as any)
        .update({ status: "accepted", accepted_at: new Date().toISOString() } as any)
        .eq("id", invitation.id);

      // Update profile with organization_id and tipo_conta
      await supabase
        .from("profiles")
        .update({
          organization_id: invitation.organization_id,
          tipo_conta: "employee",
        } as any)
        .eq("user_id", authData.user.id);

      // Add as org member
      await supabase.from("organization_members").insert({
        organization_id: invitation.organization_id,
        user_id: authData.user.id,
        role: "employee",
      });
    }

    setSubmitting(false);
    setSuccess(true);
    toast.success("Conta criada com sucesso!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <Calendar className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Convite não encontrado</h1>
        <p className="text-muted-foreground">Este link de convite é inválido ou já foi utilizado.</p>
      </div>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <CheckCircle className="h-16 w-16 text-primary mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Convite já aceito</h1>
        <p className="text-muted-foreground mb-4">Este convite já foi utilizado.</p>
        <Button variant="hero" onClick={() => navigate("/login")}>Ir para login</Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Conta criada!</h1>
        <p className="text-muted-foreground mb-4">
          Verifique seu email para confirmar sua conta e depois faça login.
        </p>
        <Button variant="hero" onClick={() => navigate("/login")}>Ir para login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-xl">
            Convite para {invitation.org_nome}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Você foi convidado(a) para fazer parte da equipe. Crie sua senha para ativar sua conta.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={invitation.nome} disabled className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={invitation.email} disabled className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmar senha</Label>
            <Input
              type="password"
              placeholder="Repita a senha"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
            />
          </div>
          <Button
            variant="hero"
            className="w-full"
            onClick={handleAccept}
            disabled={submitting || !senha || !confirmSenha}
          >
            {submitting ? "Criando conta..." : "Ativar minha conta"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
