import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Home, Key, Calendar, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSection {
  id: string;
  title: string;
  items?: { id: string; title: string }[];
}

interface ApiDocsNavigationProps {
  sections: NavSection[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

const sectionIcons: Record<string, any> = {
  introduction: Home,
  authentication: Key,
  appointments: Calendar,
  status: BarChart,
};

export function ApiDocsNavigation({ sections, activeSection, onNavigate }: ApiDocsNavigationProps) {
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <nav className="space-y-2 pr-4">
        {sections.map((section, index) => {
          const Icon = sectionIcons[section.id];
          const isActive = activeSection === section.id || section.items?.some(item => item.id === activeSection);
          
          return (
            <div key={section.id}>
              <div className="space-y-1">
                <button
                  onClick={() => onNavigate(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/50"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span>{section.title}</span>
                </button>
                {section.items && (
                  <div className="ml-6 space-y-0.5 pl-3 border-l-2 border-muted">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200",
                          activeSection === item.id
                            ? "bg-muted text-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {index < sections.length - 1 && <Separator className="my-3" />}
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
