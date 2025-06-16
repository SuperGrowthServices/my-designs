import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
import { Truck, Package, LogOut } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export type DriverTabId = 'deliveries' | 'pickups';

const tabs = [
  { id: 'deliveries' as DriverTabId, label: 'Deliveries', icon: Truck },
];

interface DriverLayoutProps {
  children: React.ReactNode;
}

export const DriverLayout: React.FC<DriverLayoutProps> = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const { isDriver, isAdmin } = useUserRoles();

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // Protect the route
  if (!user || (!isDriver && !isAdmin)) {
    return <Navigate to="/driver/login" replace />;
  }

  const sidebarItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    isActive: tab.id === 'deliveries', // Default active tab
    onClick: () => {} // Single page app for now
  }));

  const header = (
    <div className="p-4 space-y-2">
      <div className='text-center text-sm p-2 bg-blue-50 text-blue-700 rounded-md'>
        Driver: {user?.email}
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
      title="Driver Portal"
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