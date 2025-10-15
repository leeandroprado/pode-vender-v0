import { LayoutDashboard, Bot, Package, Users, Activity, UserCircle, MessageCircle, Settings, Calendar, Key, BookOpen, LogOut, Shield, BarChart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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

// Módulo: Visão Geral
const overviewItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

// Módulo: Automação
const automationItems = [
  { title: "Meus Agentes", url: "/agentes", icon: Bot },
  { title: "Conversas", url: "/conversas", icon: MessageCircle },
];

// Módulo: Gestão
const managementItems = [
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Atividades", url: "/atividades", icon: Activity },
];

// Módulo: Recursos
const resourceItems = [
  { title: "Documentação API", url: "/api-docs", icon: BookOpen },
  { title: "Minha Conta", url: "/conta", icon: UserCircle },
];

export function AppSidebar() {
  const { isSuperAdmin, isAdmin } = useUserRole();
  const { user, signOut } = useAuth();

  const renderMenuItems = (items: typeof overviewItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) =>
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm border-l-2 border-primary transition-all duration-200"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 hover:translate-x-1"
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

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
        {/* Visão Geral */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2">
            <BarChart className="h-3 w-3 inline mr-1.5" />
            Visão Geral
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(overviewItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Automação */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2">
            <Bot className="h-3 w-3 inline mr-1.5" />
            Automação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(automationItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Gestão */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2">
            <Package className="h-3 w-3 inline mr-1.5" />
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(managementItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração (apenas admin) */}
        {isAdmin && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                Administração
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/equipe"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm border-l-2 border-primary transition-all duration-200"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 hover:translate-x-1"
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
                            ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm border-l-2 border-primary transition-all duration-200"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 hover:translate-x-1"
                        }
                      >
                        <Key className="h-4 w-4" />
                        <span>API Tokens</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Sistema (apenas super admin) */}
        {isSuperAdmin && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <Settings className="h-3 w-3" />
                Sistema
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/settings-system"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm border-l-2 border-primary transition-all duration-200"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 hover:translate-x-1"
                        }
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configurações</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <Separator className="my-2" />

        {/* Recursos */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2">
            <BookOpen className="h-3 w-3 inline mr-1.5" />
            Recursos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(resourceItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuário"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email || "usuario@exemplo.com"}
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
