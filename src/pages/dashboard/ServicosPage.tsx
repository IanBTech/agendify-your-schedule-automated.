import { useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ServicosPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [duracao, setDuracao] = useState("30");
  const [preco, setPreco] = useState("");
  const [open, setOpen] = useState(false);

  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("servicos")
        .select("*")
        .eq("profissional_id", profile!.id)
        .order("created_at");
      return data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("servicos").insert({
        profissional_id: profile!.id,
        nome_servico: nome,
        duracao_minutos: Number(duracao),
        preco: preco || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      setNome(""); setDuracao("30"); setPreco(""); setOpen(false);
      toast.success("Serviço adicionado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("servicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      toast.success("Serviço removido!");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Serviços</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Adicionar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Novo serviço</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome do serviço</Label>
                <Input placeholder="Ex: Corte de cabelo" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Duração (minutos)</Label>
                <Input type="number" value={duracao} onChange={(e) => setDuracao(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Preço (opcional)</Label>
                <Input placeholder="R$ 50,00" value={preco} onChange={(e) => setPreco(e.target.value)} />
              </div>
              <Button variant="hero" className="w-full" onClick={() => addMutation.mutate()} disabled={!nome || addMutation.isPending}>
                {addMutation.isPending ? "Salvando..." : "Salvar serviço"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {servicos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Star className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Nenhum serviço cadastrado.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Adicione seus serviços para que clientes possam agendar.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {servicos.map((s) => (
            <Card key={s.id} className="shadow-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{s.nome_servico}</p>
                  <p className="text-sm text-muted-foreground">{s.duracao_minutos} min {s.preco && `• ${s.preco}`}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
