import { useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

const categorias = ["bug", "sugestão", "melhoria", "feedback geral"];

export default function FeedbackPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [categoria, setCategoria] = useState("feedback geral");
  const [mensagem, setMensagem] = useState("");

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["feedback", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feedback").insert({
        user_id: user!.id,
        rating,
        categoria,
        mensagem,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      setRating(0); setMensagem("");
      toast.success("Feedback enviado! Obrigado.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Feedback</h1>
      <p className="text-sm text-muted-foreground">Nos ajude a melhorar o Agendify.</p>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Enviar feedback</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Avaliação</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button key={v} onClick={() => setRating(v)} className="p-1">
                  <Star className={`h-6 w-6 transition-colors ${v <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea placeholder="Conte-nos o que pensa..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
          </div>
          <Button variant="hero" onClick={() => submitMutation.mutate()} disabled={!rating || !mensagem || submitMutation.isPending}>
            {submitMutation.isPending ? "Enviando..." : "Enviar feedback"}
          </Button>
        </CardContent>
      </Card>

      {feedbacks.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Seus feedbacks</h2>
          {feedbacks.map((f: any) => (
            <Card key={f.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <Star key={v} className={`h-3.5 w-3.5 ${v <= f.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(f.created_at), "dd/MM/yyyy")}</span>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground mb-2">{f.categoria}</span>
                <p className="text-sm">{f.mensagem}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
