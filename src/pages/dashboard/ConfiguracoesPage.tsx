import { useState, useEffect } from "react";
import { Settings, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categorias = [
  "Barbearia", "Salão de beleza", "Nail designer", "Personal trainer",
  "Massagista", "Tatuador(a)", "Terapeuta", "Consultor(a)", "Fotógrafo(a)",
  "Mecânico(a)", "Professor(a) particular", "Outro",
];

export default function ConfiguracoesPage() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nomeNegocio, setNomeNegocio] = useState("");
  const [categoriaNegocio, setCategoriaNegocio] = useState("");
  const [descricaoNegocio, setDescricaoNegocio] = useState("");
  const [endereco, setEndereco] = useState("");
  const [linkInstagram, setLinkInstagram] = useState("");
  const [linkWebsite, setLinkWebsite] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || "");
      setTelefone(profile.telefone || "");
      setNomeNegocio(profile.nome_negocio || "");
      setCategoriaNegocio(profile.categoria_negocio || "");
      setDescricaoNegocio(profile.descricao_negocio || "");
      setEndereco(profile.endereco || "");
      setLinkInstagram(profile.link_instagram || "");
      setLinkWebsite(profile.link_website || "");
      setSlug(profile.slug || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nome,
        telefone: telefone || null,
        nome_negocio: nomeNegocio || null,
        categoria_negocio: categoriaNegocio || null,
        descricao_negocio: descricaoNegocio || null,
        endereco: endereco || null,
        link_instagram: linkInstagram || null,
        link_website: linkWebsite || null,
        slug: slug || null,
      } as any)
      .eq("user_id", user!.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success("Configurações salvas!");
    }
  };

  const handleDeleteAccount = async () => {
    await signOut();
    toast.success("Conta desativada. Entre em contato para exclusão permanente.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Configurações</h1>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Informações pessoais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Negócio</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do negócio</Label>
            <Input placeholder="Meu negócio" value={nomeNegocio} onChange={(e) => setNomeNegocio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <select
              value={categoriaNegocio}
              onChange={(e) => setCategoriaNegocio(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Selecione</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea placeholder="Conte sobre seu negócio..." value={descricaoNegocio} onChange={(e) => setDescricaoNegocio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Endereço (opcional)</Label>
            <Input placeholder="Rua, número, bairro" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Links e redes sociais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input placeholder="https://instagram.com/seuperfil" value={linkInstagram} onChange={(e) => setLinkInstagram(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input placeholder="https://seusite.com" value={linkWebsite} onChange={(e) => setLinkWebsite(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>URL da página de agendamento</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">agendify.app/book/</span>
              <Input placeholder="meu-negocio" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="hero" onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar configurações"}
      </Button>

      <Separator />

      <Card className="shadow-card border-destructive/20">
        <CardHeader><CardTitle className="text-base font-display text-destructive">Gerenciamento da conta</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é irreversível. Todos os seus dados serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                  Sim, excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
