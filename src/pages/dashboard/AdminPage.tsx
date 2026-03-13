import { useState } from "react";
import { ShieldCheck, Users, Trash2, MessageSquare, Key, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AdminUsers() {
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("admin_delete_user", { _profile_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário e dados relacionados removidos!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Users className="h-5 w-5" /> Usuários ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Data</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell>
                    <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-muted">{u.plano}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(u.created_at), "dd/MM/yy")}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive h-7">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(u.id)} className="bg-destructive text-destructive-foreground">
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminFeedback() {
  const { data: feedbacks = [] } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Feedbacks ({feedbacks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum feedback ainda.</p>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((f: any) => (
              <div key={f.id} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={`text-sm ${n <= f.rating ? "text-primary" : "text-muted-foreground/20"}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(f.created_at), "dd/MM/yy")}
                  </span>
                </div>
                <p className="text-sm mt-1">{f.mensagem}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminPaymentConfig() {
  const [asaasKey, setAsaasKey] = useState(() => {
    try { return JSON.parse(localStorage.getItem("agendify_payment_config") || "{}").asaasApiKey || ""; } catch { return ""; }
  });
  const [pixKey, setPixKey] = useState(() => {
    try { return JSON.parse(localStorage.getItem("agendify_payment_config") || "{}").pixKey || ""; } catch { return ""; }
  });

  const save = () => {
    localStorage.setItem("agendify_payment_config", JSON.stringify({ asaasApiKey: asaasKey, pixKey }));
    toast.success("Configurações salvas!");
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Key className="h-5 w-5" /> Configuração de Pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Chave API Asaas</Label>
          <Input type="password" value={asaasKey} onChange={(e) => setAsaasKey(e.target.value)} placeholder="$aact_..." />
        </div>
        <div className="space-y-2">
          <Label>Chave PIX</Label>
          <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="email@exemplo.com" />
        </div>
        <Button variant="hero" onClick={save}>
          <Save className="h-4 w-4 mr-1" /> Salvar
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold flex items-center gap-2">
        <ShieldCheck className="h-6 w-6" /> Painel Admin
      </h1>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <AdminUsers />
        </TabsContent>
        <TabsContent value="feedback" className="mt-4">
          <AdminFeedback />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <AdminPaymentConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
