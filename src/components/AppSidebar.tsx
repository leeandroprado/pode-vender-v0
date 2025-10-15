import { LayoutDashboard, Bot, Package, Users, Activity, UserCircle, MessageCircle, Settings, Calendar, Key, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Meus Agentes", url: "/agentes", icon: Bot },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Conversas", url: "/conversas", icon: MessageCircle },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Atividades", url: "/atividades", icon: Activity },
  { title: "Documentação API", url: "/api-docs", icon: BookOpen },
  { title: "Minha Conta", url: "/conta", icon: UserCircle },
];

export function AppSidebar() {
  const { isSuperAdmin, isAdmin } = useUserRole();
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground">IA Atendimento</h2>
            <p className="text-xs text-sidebar-foreground/60">Plataforma Inteligente</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/equipe"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }
                      >
                        <Users className="h-4 w-4" />
                        <span>Equipe</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/api-tokens"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }
                      >
                        <Key className="h-4 w-4" />
                        <span>API Tokens</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/settings-system"
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <UserCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Usuário Demo</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">usuario@exemplo.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
