import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Servico {
  id: string;
  nome: string;
  duracao: number;
  preco: string;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [nome, setNome] = useState("");
  const [duracao, setDuracao] = useState("30");
  const [preco, setPreco] = useState("");
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (!nome) return;
    setServicos([...servicos, { id: crypto.randomUUID(), nome, duracao: Number(duracao), preco }]);
    setNome("");
    setDuracao("30");
    setPreco("");
    setOpen(false);
  };

  const handleRemove = (id: string) => {
    setServicos(servicos.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Serviços</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Novo serviço</DialogTitle>
            </DialogHeader>
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
              <Button variant="hero" className="w-full" onClick={handleAdd}>Salvar serviço</Button>
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
                  <p className="font-semibold">{s.nome}</p>
                  <p className="text-sm text-muted-foreground">{s.duracao} min {s.preco && `• ${s.preco}`}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(s.id)}>
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
