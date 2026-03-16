import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, CreditCard, Gift, Settings, ShieldCheck, UsersRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Agenda", url: "/dashboard/agenda", icon: Calendar },
  { title: "Clientes", url: "/dashboard/clientes", icon: Users },
  { title: "Planos", url: "/dashboard/planos", icon: CreditCard },
  { title: "Indicações", url: "/dashboard/indicacoes", icon: Gift },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isAdmin, profile } = useAuth();

  const isCompanyAdmin = profile?.tipo_conta === "empresa";
  const isEmployee = profile?.tipo_conta === "employee";

  // Build menu: employees don't see billing/settings
  let allItems = isEmployee
    ? menuItems.filter(item => !["Planos", "Indicações", "Configurações"].includes(item.title))
    : [...menuItems];

  if (isCompanyAdmin) {
    allItems = [...allItems.slice(0, 3), { title: "Equipe", url: "/dashboard/equipe", icon: UsersRound }, ...allItems.slice(3)];
  }

  if (isAdmin) {
    allItems = [...allItems, { title: "Admin", url: "/dashboard/admin", icon: ShieldCheck }];
  }

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
