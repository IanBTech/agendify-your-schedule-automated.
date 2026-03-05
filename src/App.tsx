import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/CadastroPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AgendaPage from "./pages/dashboard/AgendaPage";
import CalendarioPage from "./pages/dashboard/CalendarioPage";
import ServicosPage from "./pages/dashboard/ServicosPage";
import DisponibilidadePage from "./pages/dashboard/DisponibilidadePage";
import ClientesPage from "./pages/dashboard/ClientesPage";
import IndicacoesPage from "./pages/dashboard/IndicacoesPage";
import PlanosPage from "./pages/dashboard/PlanosPage";
import ConfiguracoesPage from "./pages/dashboard/ConfiguracoesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="calendario" element={<CalendarioPage />} />
            <Route path="servicos" element={<ServicosPage />} />
            <Route path="disponibilidade" element={<DisponibilidadePage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="indicacoes" element={<IndicacoesPage />} />
            <Route path="planos" element={<PlanosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
