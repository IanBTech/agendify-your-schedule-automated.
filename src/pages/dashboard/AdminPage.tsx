import { ShieldCheck, Users, UserCheck, UserX, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.status_conta === "ativo").length;
  const inactiveUsers = users.filter((u: any) => u.status_conta !== "ativo").length;

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status_conta: newStatus } as any)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status atualizado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const stats = [
    { label: "Total de usuários", value: totalUsers, icon: Users },
    { label: "Ativos", value: activeUsers, icon: UserCheck },
    { label: "Inativos", value: inactiveUsers, icon: UserX },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold">Painel Admin</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Usuários registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Profissão</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell className="text-sm">{u.profissao || "-"}</TableCell>
                      <TableCell className="text-sm">{u.plano}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.status_conta === "ativo" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {u.status_conta}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{format(new Date(u.created_at), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {u.status_conta === "ativo" ? (
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => toggleStatusMutation.mutate({ userId: u.user_id, newStatus: "inativo" })}
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" /> Desativar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => toggleStatusMutation.mutate({ userId: u.user_id, newStatus: "ativo" })}
                            >
                              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reativar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
