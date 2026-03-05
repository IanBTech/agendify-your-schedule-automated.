import { Settings } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Configurações</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Settings className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <p className="text-muted-foreground">Configurações do perfil em breve.</p>
      </div>
    </div>
  );
}
