import { Calendar } from "lucide-react";

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Calendário</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Calendar className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <p className="text-muted-foreground">Visualização do calendário em breve.</p>
      </div>
    </div>
  );
}
