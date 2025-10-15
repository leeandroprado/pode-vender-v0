import { LayoutDashboard, Bot, Package, Users, Activity, UserCircle, MessageCircle, Settings, Calendar, Key, BookOpen, LogOut, Shield, BarChart, Briefcase, Library } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
            <h2 className="text-base font-semibold text-sidebar-foreground">IA Atendimento</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        {/* Visão Geral */}
        <SidebarGroup className="mb-4">
          <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-sidebar-foreground/50 flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>VISÃO GERAL</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(overviewItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Automação */}
        <SidebarGroup className="mb-4">
          <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-sidebar-foreground/50 flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>AUTOMAÇÃO</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(automationItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestão */}
        <SidebarGroup className="mb-4">
          <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-sidebar-foreground/50 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>GESTÃO</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(managementItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração (apenas admin) */}
        {isAdmin && (
          <SidebarGroup className="mb-4">
            <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-sidebar-foreground/50 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>ADMINISTRAÇÃO</span>
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
        )}

        {/* Sistema (apenas super admin) */}
        {isSuperAdmin && (
          <SidebarGroup className="mb-4">
            <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-sidebar-foreground/50 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>SISTEMA</span>
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
        )}

        {/* Recursos */}
        <SidebarGroup className="mb-4">
          <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-sidebar-foreground/50 flex items-center gap-2">
            <Library className="h-4 w-4" />
            <span>RECURSOS</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(resourceItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
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
