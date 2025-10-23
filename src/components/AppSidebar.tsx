import { LayoutDashboard, Bot, Package, Users, Activity, UserCircle, MessageCircle, Settings, Calendar, Key, BookOpen, LogOut, Shield, BarChart, Briefcase, Library, ShoppingCart, CreditCard, Building2, Crown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
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
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Atividades", url: "/atividades", icon: Activity },
];

// Módulo: Recursos
const resourceItems = [
  { title: "Documentação API", url: "/api-docs", icon: BookOpen },
  { title: "Planos", url: "/planos", icon: CreditCard },
  { title: "Minha Conta", url: "/conta", icon: UserCircle },
];

export function AppSidebar() {
  const { isSuperAdmin, isAdmin, isOwner } = useUserRole();
  const { user, signOut } = useAuth();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-white/10 text-white font-medium rounded-lg"
      : "text-white/80 hover:bg-white/5 hover:text-white rounded-lg";

  const renderMenuItems = (items: typeof overviewItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end={item.url === "/"}
              className={getNavLinkClass}
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
      <SidebarHeader className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-base font-semibold text-white">IA Atendimento</h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Visão Geral */}
        <SidebarGroup className="mb-1">
          <SidebarGroupLabel className="px-2 py-1 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
            VISÃO GERAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(overviewItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Automação */}
        <SidebarGroup className="mb-1">
          <SidebarGroupLabel className="px-2 py-1 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
            AUTOMAÇÃO
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/agentes" className={getNavLinkClass}>
                      <Bot className="h-4 w-4" />
                      <span>Meus Agentes</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/conversas" className={getNavLinkClass}>
                    <MessageCircle className="h-4 w-4" />
                    <span>Conversas</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestão */}
        <SidebarGroup className="mb-1">
          <SidebarGroupLabel className="px-2 py-1 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
            GESTÃO
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/produtos" className={getNavLinkClass}>
                    <Package className="h-4 w-4" />
                    <span>Produtos</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/clientes" className={getNavLinkClass}>
                    <Users className="h-4 w-4" />
                    <span>Clientes</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/pedidos" className={getNavLinkClass}>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Pedidos</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/agenda" className={getNavLinkClass}>
                    <Calendar className="h-4 w-4" />
                    <span>Agenda</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/atividades" className={getNavLinkClass}>
                      <Activity className="h-4 w-4" />
                      <span>Atividades</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração (apenas admin) */}
        {isAdmin && (
          <SidebarGroup className="mb-1">
            <SidebarGroupLabel className="px-2 py-1 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
              ADMINISTRAÇÃO
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/equipe" className={getNavLinkClass}>
                      <Users className="h-4 w-4" />
                      <span>Equipe</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/api-tokens" className={getNavLinkClass}>
                      <Key className="h-4 w-4" />
                      <span>API Tokens</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Owner (apenas owner) */}
        {isOwner && (
          <SidebarGroup className="mb-1">
            <SidebarGroupLabel className="px-2 py-1 text-[10px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1">
              <Crown className="h-3 w-3" />
              OWNER
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/dashboard" className={getNavLinkClass}>
                      <BarChart className="h-4 w-4" />
                      <span>Dashboard Global</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/organizacoes" className={getNavLinkClass}>
                      <Building2 className="h-4 w-4" />
                      <span>Organizações</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/gerenciar-planos" className={getNavLinkClass}>
                      <CreditCard className="h-4 w-4" />
                      <span>Gerenciar Planos</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Sistema (apenas super admin) */}
        {isSuperAdmin && (
          <SidebarGroup className="mb-1">
            <SidebarGroupLabel className="px-2 py-1 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
              SISTEMA
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/settings-system" className={getNavLinkClass}>
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
        <SidebarGroup className="mb-1">
          <SidebarGroupLabel className="px-2 py-1 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
            RECURSOS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(resourceItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-10 w-10 ring-2 ring-white/20">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-white/20 text-white font-semibold">
              {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate flex items-center gap-1">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuário"}
              {isOwner && <Crown className="h-3 w-3 text-yellow-400" />}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={signOut}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
