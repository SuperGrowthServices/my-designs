import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
import { Home, FileText, HeadphonesIcon, Settings, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';

export type DashboardTab = 'home' | 'quotes' | 'support' | 'settings';

const tabs = [
  { id: 'home' as DashboardTab, label: 'Dashboard', icon: Home },
  { id: 'quotes' as DashboardTab, label: 'Order History', icon: FileText },
  { id: 'support' as DashboardTab, label: 'Support', icon: HeadphonesIcon },
  { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userProfile?: any;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  userProfile
}) => {
  const { signOut } = useAuth();
  const { isAdmin: isAdminUser } = useUserRoles(); // Rename to avoid confusion
  const navigate = useNavigate();

  const sidebarItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    isActive: activeTab === tab.id,
    onClick: () => onTabChange(tab.id)
  }));

  const header = (
    <div className="p-4 space-y-2">
      <div className='text-center text-sm p-2 bg-gray-50 text-gray-700 rounded-md'>
        Buyer: {userProfile?.full_name}
      </div>
    </div>
  );

  const footer = (
    <div className="space-y-3">
      {/* Only show admin switch if isAdmin() returns true */}
      {isAdminUser() && (
        <div className="space-y-2 border-b border-gray-200 pb-3 mb-3">
          <p className="text-xs text-gray-500 mb-2">Switch Dashboard</p>
          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            className="w-full text-sm bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Mode
          </Button>
        </div>
      )}

      <Button
        onClick={signOut}
        variant="outline"
        className="w-full flex items-center justify-center"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );

  return (
    <ResponsiveSidebar
      title="Buyer Dashboard"
      subtitle="EasyCarParts.ae"
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
