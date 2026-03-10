import { Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function IndicacoesPage() {
  const { profile } = useAuth();
  const code = profile?.codigo_indicacao ?? "";

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nome, email, created_at")
        .eq("indicador_id", profile!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const copiar = () => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Indicações</h1>
      <p className="text-sm text-muted-foreground">
        Indique profissionais e ganhe 1 mês grátis para cada indicação.
      </p>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display">Seu código de indicação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={code} readOnly className="font-mono text-sm tracking-wider" />
            <Button variant="outline" size="icon" onClick={copiar}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Compartilhe este código. Novos usuários podem informá-lo no cadastro.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="font-display text-3xl font-bold">{referrals.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Indicações</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="font-display text-3xl font-bold">{profile?.meses_bonus ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Meses grátis</p>
          </CardContent>
        </Card>
      </div>

      {referrals.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display">Usuários indicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{r.nome}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
