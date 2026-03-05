import { Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function ClientesPage() {
  const { profile } = useAuth();

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("clientes")
        .select("*")
        .eq("profissional_id", profile!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Clientes</h1>
      {clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Seus clientes aparecerão aqui após o primeiro agendamento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientes.map((c) => (
            <Card key={c.id} className="shadow-card">
              <CardContent className="p-4">
                <p className="font-semibold">{c.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {c.telefone && `📞 ${c.telefone}`} {c.email && `• ✉️ ${c.email}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
