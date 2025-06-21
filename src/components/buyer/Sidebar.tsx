import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Settings,
  ShieldAlert,
  User,
  ChevronsLeftRight,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ className, activeTab, onTabChange }: SidebarProps) => {
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: "orderHistory",
      label: "Order History",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      id: "support",
      label: "Support",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r p-4",
        className
      )}
    >
      <div className="flex items-center gap-3 p-3 mb-4 bg-muted rounded-lg">
        <div className="p-2 bg-primary/10 rounded-full">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Buyer:</p>
          <p className="text-sm font-semibold">hello@sgservices.ae</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
         <button
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted"
            )}
          >
            <ShieldAlert className="h-5 w-5" />
            Admin Mode
        </button>
        <button
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 mt-1 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted"
          )}
        >
          <ChevronsLeftRight className="h-5 w-5" />
          Switch Dashboard
        </button>
      </div>
    </div>
  );
}; 