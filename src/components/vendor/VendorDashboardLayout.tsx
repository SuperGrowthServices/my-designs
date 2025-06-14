import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
import { Home, BarChart3, Settings, LogOut, Package } from 'lucide-react';

export type VendorDashboardTab = 'home' | 'ready-to-ship' | 'sales-history' | 'settings';

const tabs = [
  { id: 'home' as VendorDashboardTab, label: 'Vendor Home', icon: Home },
  { id: 'ready-to-ship' as VendorDashboardTab, label: 'Ready to Ship', icon: Package },
  { id: 'sales-history' as VendorDashboardTab, label: 'Sales History', icon: BarChart3 },
  { id: 'settings' as VendorDashboardTab, label: 'Settings', icon: Settings },
];

interface VendorDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: VendorDashboardTab;
  onTabChange: (tab: VendorDashboardTab) => void;
  userProfile?: any;
}

export const VendorDashboardLayout: React.FC<VendorDashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  userProfile
}) => {
  const { signOut } = useAuth();

  const sidebarItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    isActive: activeTab === tab.id,
    onClick: () => onTabChange(tab.id)
  }));

  const header = (
    <div className="p-4 space-y-2">
      <div className='text-center text-sm p-2 bg-mint-50 text-mint-700 rounded-md'>
        Vendor: {userProfile?.business_name || userProfile?.full_name}
      </div>
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
      title="Vendor Portal"
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
