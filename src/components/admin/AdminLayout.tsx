import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
import { Home, Users, FileText, Settings, LogOut, Package, History, Truck } from 'lucide-react';

export type AdminTabId = 'overview' | 'users' | 'applications' | 'orders' | 'logistics' | 'logs';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
}

const tabs = [
  { id: 'overview' as AdminTabId, label: 'Overview', icon: Home },
  { id: 'users' as AdminTabId, label: 'Users', icon: Users },
  { id: 'applications' as AdminTabId, label: 'Applications', icon: FileText },
  { id: 'orders' as AdminTabId, label: 'Orders', icon: History },
  { id: 'logistics' as AdminTabId, label: 'Logistics', icon: Truck },
  { id: 'logs' as AdminTabId, label: 'Logs', icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { user, signOut } = useAuth();
  const { isVendor } = useUserRoles();

  const sidebarItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    isActive: activeTab === tab.id,
    onClick: () => onTabChange(tab.id)
  }));

  const header = (
    <div className="p-4 space-y-2">
      <div className='text-center text-sm p-2 bg-red-50 text-red-700 rounded-md'>
        Admin: {user?.email}
      </div>
      <Button
        onClick={() => window.location.href = '/dashboard'}
        variant="outline"
        className="w-full text-sm"
      >
        Buyer Mode
      </Button>
      {isVendor() && (
        <Button
          onClick={() => window.location.href = '/vendor'}
          variant="outline"
          className="w-full text-sm"
        >
          Vendor Mode
        </Button>
      )}
    </div>
  );

  const footer = (
    <Button
      onClick={signOut}
      variant="outline"
      className="w-full flex items-center justify-center"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );

  return (
    <ResponsiveSidebar
      title="Admin Panel"
      subtitle="EasyAutoParts.ae"
      items={sidebarItems}
      header={header}
      footer={footer}
    >
      <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </ResponsiveSidebar>
  );
}; 