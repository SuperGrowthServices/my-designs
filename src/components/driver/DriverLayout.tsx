import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
import { Truck, LogOut } from 'lucide-react';
import { Navigate } from 'react-router-dom';

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

  const sidebarItems = [
    {
      id: 'logistics',
      label: 'Deliveries',
      icon: Truck,
      isActive: true,
      onClick: () => {} // Only one page, no navigation needed
    }
  ];

  const header = (
    <div className="p-4 space-y-2">
      <div className='text-center text-sm p-2 bg-blue-50 text-blue-700 rounded-md'>
        Driver: {user?.email}
      </div>
    </div>
  );

  const footer = (
    <div className="p-4">
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
      title="Driver Portal"
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