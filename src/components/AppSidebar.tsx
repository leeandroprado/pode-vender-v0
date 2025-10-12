import { LayoutDashboard, Bot, Package, Users, Activity, MessageCircle, Settings, ShoppingCart, Users2, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Agentes", url: "/agentes", icon: Bot },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Multi Chat", url: "/conversas", icon: MessageCircle },
  { title: "Equipe", url: "/equipe", icon: Users2 },
  { title: "Atividades", url: "/atividades", icon: Activity },
];

export function AppSidebar() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const renderMenuItem = ({ url, title, icon: Icon }: typeof menuItems[0]) => (
    <SidebarMenuItem key={title} className="list-none p-0">
      <NavLink to={url} end={url === "/"} className="block w-full">
        {({ isActive }) => (
          <div
            className={`flex items-center gap-3 rounded-md p-3 mx-2 transition-colors ${
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}>
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{title}</span>
          </div>
        )}
      </NavLink>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className="w-[240px] border-r">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold">Pode Vender</h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-4 mb-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map(renderMenuItem)}
              {isAdmin && renderMenuItem({ title: "Logs", url: "/logs", icon: FileText })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
