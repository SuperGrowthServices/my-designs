import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requireApproval?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireApproval = false
}) => {
  const { user, loading } = useAuth(); // Keep loading from auth context
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const fetchUserRoleAndStatus = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        // Get user role and approval status
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, is_approved')
          .eq('user_id', user.id)
          .single();

        if (roleError || !roleData) {
          // Default to buyer if no role found (like old version)
          setUserRole('buyer');
          setIsApproved(true);
        } else {
          setUserRole(roleData.role);
          setIsApproved(roleData.is_approved || false);

          // If approval is required for vendors, also check profile status
          if (requireApproval && roleData.role === 'vendor') {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('application_status')
              .eq('id', user.id)
              .single();

            // Vendor needs both role approval AND profile approval
            const isFullyApproved = roleData.is_approved && 
              profile?.application_status === 'approved';
            setIsApproved(isFullyApproved);
          }
        }
      } catch (error) {
        console.error('Error checking user authorization:', error);
        setUserRole('buyer'); // Fallback to buyer
        setIsApproved(true);
      }

      setCheckingRole(false);
    };

    fetchUserRoleAndStatus();
  }, [user, requireApproval]);

  // Show loading while auth or role check is in progress
  if (loading || checkingRole) {
    return <div>Loading...</div>;
  }

  // If no user, redirect to login/home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If role is not in allowed roles, redirect to appropriate dashboard
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Smart routing based on actual user role (like old version)
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'vendor':
        return <Navigate to="/vendor" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // If approval is required but user is not approved, redirect to status page
  if (requireApproval && userRole === 'vendor' && !isApproved) {
    return <Navigate to="/vendor/status" replace />;
  }

  // User is authorized, render children
  return <>{children}</>;
};