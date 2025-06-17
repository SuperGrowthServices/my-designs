import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;
      
      if (!user) {
        navigate('/', { replace: true });
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, is_approved')
        .eq('user_id', user.id)
        .single();

      if (!roleData || !allowedRoles.includes(roleData.role)) {
        navigate('/', { replace: true });
        return;
      }

      setIsAuthorized(true);
      setCheckingAuth(false);
    };

    checkAuth();
  }, [user, loading, allowedRoles, navigate]);

  if (loading || checkingAuth) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <>{children}</> : null;
};