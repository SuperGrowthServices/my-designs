
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  onClick: () => void;
}

interface ResponsiveSidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  title,
  subtitle,
  items,
  header,
  footer,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const SidebarContent = () => (
    <div className="flex flex-col h-full sidebar-modern">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold text-primary truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">{subtitle}</p>}
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="md:hidden h-8 w-8 p-0 ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {header}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                item.onClick();
                if (isMobile) setIsOpen(false);
              }}
              className={`nav-item ${
                item.isActive ? 'nav-item-active' : 'nav-item-inactive'
              } h-12 md:h-auto`}
            >
              <Icon className={`nav-icon ${item.isActive ? 'nav-icon-active' : ''} w-4 h-4 md:w-5 md:h-5`} />
              <span className="font-medium text-sm md:text-base truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-3 md:p-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg h-10 w-10 p-0"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 sm:w-80">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="pt-20 px-4">
          {children}
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 lg:w-72 flex-shrink-0">
        <SidebarContent />
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
};
