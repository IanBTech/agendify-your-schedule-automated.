import { Gift, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function IndicacoesPage() {
  const { profile } = useAuth();
  const link = `agendify.com/convite/${profile?.codigo_indicacao ?? ""}`;

  const copiar = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Indicações</h1>
      <p className="text-sm text-muted-foreground">
        Indique profissionais e ganhe 1 mês grátis para cada indicação.
      </p>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display">Seu link de convite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={link} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={copiar}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="font-display text-3xl font-bold">0</p>
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
    </div>
  );
}
