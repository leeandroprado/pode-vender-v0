import { ScrollArea } from "@/components/ui/scroll-area";
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

export function ApiDocsNavigation({ sections, activeSection, onNavigate }: ApiDocsNavigationProps) {
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <nav className="space-y-1 pr-4">
        {sections.map((section) => (
          <div key={section.id} className="space-y-1">
            <button
              onClick={() => onNavigate(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {section.title}
            </button>
            {section.items && (
              <div className="ml-4 space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                      activeSection === item.id
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}
