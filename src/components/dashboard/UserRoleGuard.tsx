
import React from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface UserRoleGuardProps {
  children: React.ReactNode;
}

export const UserRoleGuard: React.FC<UserRoleGuardProps> = ({ children }) => {
  const { userRoles, loading, hasRole } = useUserRoles();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Check if user has buyer or admin role
  const hasBuyerAccess = hasRole('buyer') || hasRole('admin');

  if (!hasBuyerAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            This dashboard is only available for buyers. 
            {hasRole('vendor') && ' Please use the vendor dashboard.'}
          </p>
          {hasRole('vendor') && (
            <button
              onClick={() => window.location.href = '/vendor'}
              className="text-blue-600 hover:underline"
            >
              Go to Vendor Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
