import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserRole(data.role);
      } else {
        // Default to buyer if no role found
        setUserRole('buyer');
      }
      setCheckingRole(false);
    };

    fetchUserRole();
  }, [user]);

  if (loading || checkingRole) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect based on actual user role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'vendor':
        return <Navigate to="/vendor" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};