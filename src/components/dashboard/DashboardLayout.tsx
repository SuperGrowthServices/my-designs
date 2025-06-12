
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { DashboardTab } from '@/pages/Dashboard';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
import { 
  Home, 
  FileText, 
  HeadphonesIcon, 
  Settings as SettingsIcon, 
  LogOut,
  User,
  Shield
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userProfile?: any;
  showVendorSwitch?: boolean;
  onSwitchToVendor?: () => void;
}

const tabs = [
  { id: 'home' as DashboardTab, label: 'Dashboard', icon: Home },
  { id: 'quotes' as DashboardTab, label: 'Order History', icon: FileText },
  { id: 'support' as DashboardTab, label: 'Support', icon: HeadphonesIcon },
  { id: 'settings' as DashboardTab, label: 'Settings', icon: SettingsIcon },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  userProfile,
  showVendorSwitch,
  onSwitchToVendor
}) => {
  const { signOut } = useAuth();
  const { isAdmin } = useUserRoles();

  const sidebarItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    isActive: activeTab === tab.id,
    onClick: () => onTabChange(tab.id)
  }));

  const header = (
    <div className="mt-4">
      {userProfile && (
        <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
          <User className="w-4 h-4 mr-2" />
          <span className="font-medium">{userProfile.full_name}</span>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="space-y-3">
      {/* Mode Switch Buttons */}
      <div className="space-y-2">
        {showVendorSwitch && onSwitchToVendor && (
          <Button
            onClick={onSwitchToVendor}
            variant="outline"
            className="w-full text-sm bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100"
          >
            🧰 Vendor Mode
          </Button>
        )}
        
        {isAdmin() && (
          <Button
            onClick={() => window.location.href = '/admin'}
            variant="outline"
            className="w-full text-sm bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        )}
      </div>

      {/* Sign Out Button */}
      <Button
        onClick={signOut}
        variant="outline"
        className="w-full flex items-center justify-center hover:bg-gray-50"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );

  return (
    <ResponsiveSidebar
      title="EasyAutoParts.ae"
      subtitle="Buyer Dashboard"
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
