import { useState, useEffect } from "react";
import { Users, UserPlus, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  nome: string;
  email: string;
  slug: string | null;
  profissao: string | null;
}

interface Invitation {
  id: string;
  email: string;
  nome: string;
  status: string;
  token: string;
  created_at: string;
}

export default function EquipePage() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteNome, setInviteNome] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.organization_id) loadTeam();
  }, [profile?.organization_id]);

  const loadTeam = async () => {
    if (!profile?.organization_id) return;
    setLoading(true);

    const [{ data: membersData }, { data: invitesData }] = await Promise.all([
      supabase
        .from("organization_members")
        .select("user_id, role")
        .eq("organization_id", profile.organization_id),
      supabase
        .from("invitations" as any)
        .select("id, email, nome, status, token, created_at")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false }),
    ]);

    if (membersData && membersData.length > 0) {
      const userIds = membersData.map((m: any) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, slug, profissao, user_id")
        .in("user_id", userIds);

      const teamMembers = (profiles || [])
        .filter((p: any) => p.user_id !== profile.user_id)
        .map((p: any) => ({
          id: p.id,
          nome: p.nome,
          email: p.email,
          slug: p.slug,
          profissao: p.profissao,
        }));
      setMembers(teamMembers);
    } else {
      setMembers([]);
    }

    setInvitations((invitesData as any) || []);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteNome.trim() || !inviteEmail.trim() || !profile?.organization_id || !profile?.id) return;
    setSubmitting(true);

    const { error } = await supabase.from("invitations" as any).insert({
      organization_id: profile.organization_id,
      invited_by: profile.id,
      email: inviteEmail.trim().toLowerCase(),
      nome: inviteNome.trim(),
    } as any);

    setSubmitting(false);
    if (error) {
      toast.error("Erro ao criar convite: " + error.message);
    } else {
      toast.success("Convite criado com sucesso!");
      setInviteNome("");
      setInviteEmail("");
      setInviteOpen(false);
      loadTeam();
    }
  };

  const getInviteLink = (token: string) => {
    return `${window.location.origin}/invite/${token}`;
  };

  const getBookingLink = (slug: string | null) => {
    if (!slug) return null;
    return `${window.location.origin}/book/${slug}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Equipe</h1>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <UserPlus className="h-4 w-4 mr-2" /> Convidar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Funcionário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Nome do funcionário" value={inviteNome} onChange={(e) => setInviteNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@exemplo.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Input value="Funcionário" disabled className="opacity-60" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button variant="hero" onClick={handleInvite} disabled={submitting || !inviteNome.trim() || !inviteEmail.trim()}>
                {submitting ? "Enviando..." : "Criar Convite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Users className="h-4 w-4" /> Membros da equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum funcionário na equipe ainda. Convide alguém!</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">{member.nome}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.profissao && <p className="text-xs text-muted-foreground">{member.profissao}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Funcionário</Badge>
                    {member.slug && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(getBookingLink(member.slug)!)}
                          title="Copiar link de agendamento"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(getBookingLink(member.slug)!, "_blank")}
                          title="Abrir página de agendamento"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display">Convites pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">{inv.nome}</p>
                    <p className="text-sm text-muted-foreground">{inv.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={inv.status === "accepted" ? "default" : "outline"}>
                      {inv.status === "accepted" ? "Aceito" : "Pendente"}
                    </Badge>
                    {inv.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(getInviteLink(inv.token))}
                        title="Copiar link do convite"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
