import { Users } from "lucide-react";

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Clientes</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <p className="text-muted-foreground">Seus clientes aparecerão aqui após o primeiro agendamento.</p>
      </div>
    </div>
  );
}
