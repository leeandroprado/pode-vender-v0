import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrialBanner } from "@/components/TrialBanner";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <SubscriptionGuard>
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card px-3 md:px-6">
              <SidebarTrigger className="-ml-2" />
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
                <Button variant="ghost" size="sm" onClick={signOut} className="h-8 md:h-9">
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            </div>
            <div className="p-3 md:p-6">
              <TrialBanner />
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </SubscriptionGuard>
  );
}
