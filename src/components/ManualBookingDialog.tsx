import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  onSuccess: () => void;
}

export default function ManualBookingDialog({ onSuccess }: Props) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    cliente_nome: "",
    cliente_telefone: "",
    cliente_email: "",
    servico_id: "",
    data: "",
    horario: "",
    notas: "",
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("servicos")
        .select("*")
        .eq("profissional_id", profile!.id)
        .eq("ativo", true);
      return data ?? [];
    },
  });

  const handleSubmit = async () => {
    if (!profile || !form.cliente_nome || !form.servico_id || !form.data || !form.horario) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("agendamentos").insert({
      profissional_id: profile.id,
      servico_id: form.servico_id,
      data: form.data,
      horario: form.horario,
      cliente_nome: form.cliente_nome,
      cliente_telefone: form.cliente_telefone || null,
      cliente_email: form.cliente_email || null,
      status: "confirmado",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao criar agendamento.");
    } else {
      toast.success("Agendamento criado!");
      setForm({ cliente_nome: "", cliente_telefone: "", cliente_email: "", servico_id: "", data: "", horario: "", notas: "" });
      setOpen(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Novo agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar agendamento manual</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do cliente *</Label>
            <Input value={form.cliente_nome} onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })} placeholder="Nome do cliente" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.cliente_telefone} onChange={(e) => setForm({ ...form, cliente_telefone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.cliente_email} onChange={(e) => setForm({ ...form, cliente_email: e.target.value })} placeholder="email@ex.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Serviço *</Label>
            <Select value={form.servico_id} onValueChange={(v) => setForm({ ...form, servico_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {servicos.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.nome_servico}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Horário *</Label>
              <Input type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Notas internas..." rows={2} />
          </div>
          <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Criando..." : "Criar agendamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
