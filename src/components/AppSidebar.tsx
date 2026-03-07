import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, CalendarDays, Star, Clock, Users,
  Gift, CreditCard, Settings, MessageSquare, Link2, ShieldCheck, Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Agenda", url: "/dashboard/agenda", icon: Calendar },
  { title: "Calendário", url: "/dashboard/calendario", icon: CalendarDays },
  { title: "Serviços", url: "/dashboard/servicos", icon: Star },
  { title: "Disponibilidade", url: "/dashboard/disponibilidade", icon: Clock },
  { title: "Clientes", url: "/dashboard/clientes", icon: Users },
  { title: "Meu Link", url: "/dashboard/meu-link", icon: Link2 },
  { title: "Indicações", url: "/dashboard/indicacoes", icon: Gift },
  { title: "Feedback", url: "/dashboard/feedback", icon: MessageSquare },
  { title: "Planos", url: "/dashboard/planos", icon: CreditCard },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isAdmin } = useAuth();

  const allItems = isAdmin
    ? [...menuItems, { title: "Admin", url: "/dashboard/admin", icon: ShieldCheck }]
    : menuItems;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <RouterLink to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 rounded-lg gradient-primary flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display text-lg font-bold text-sidebar-foreground">AGENDIFY</span>}
        </RouterLink>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? "bg-sidebar-accent text-sidebar-primary" : ""}
                    >
                      <RouterLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </RouterLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
