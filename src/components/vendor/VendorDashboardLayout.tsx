import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
import { 
  Home, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut,
  Building,
  Package,
  User,
  Search,
  List,
  Check
} from 'lucide-react';

export type VendorDashboardTab = 'home' | 'ready-to-ship' | 'sales-history' | 'settings';

interface VendorDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: VendorDashboardTab | 'home';
  onTabChange: (tab: any) => void;
  userProfile?: any;
  onSwitchToBuyer: () => void;
  isDesignMode?: boolean;
}

const liveTabs = [
  { id: 'home' as VendorDashboardTab, label: 'Vendor Home', icon: Home },
  { id: 'ready-to-ship' as VendorDashboardTab, label: 'Ready to Ship', icon: Package },
  { id: 'sales-history' as VendorDashboardTab, label: 'Sales History', icon: BarChart3 },
  { id: 'settings' as VendorDashboardTab, label: 'Settings', icon: SettingsIcon },
];

const designTabs = [
    { id: 'home' as const, label: 'Dashboard', icon: Home },
];

export const VendorDashboardLayout: React.FC<VendorDashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  userProfile,
  onSwitchToBuyer,
  isDesignMode = false
}) => {
  const { signOut } = useAuth();
  
  const tabs = isDesignMode ? designTabs : liveTabs;

  const sidebarItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    isActive: activeTab === tab.id,
    onClick: () => onTabChange(tab.id)
  }));

  const header = (
    <div className="mt-4 space-y-3">
      {userProfile && (
        <div className="flex items-center text-sm text-mint-700 bg-mint-50 rounded-lg p-3">
          <Building className="w-4 h-4 mr-2" />
          <span className="font-medium">{userProfile.business_name || userProfile.full_name}</span>
        </div>
      )}

      {!isDesignMode && (
          <Button
            onClick={onSwitchToBuyer}
            variant="outline"
            className="w-full text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            👤 Switch to Buyer Mode
          </Button>
      )}
    </div>
  );

  const footer = (
    <Button
      onClick={signOut}
      variant="outline"
      className="w-full flex items-center justify-center hover:bg-gray-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );

  return (
    <ResponsiveSidebar
      title="EasyAutoParts.ae"
      subtitle="Vendor Dashboard"
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
