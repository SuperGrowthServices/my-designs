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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      // Check user roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, is_approved')
        .eq('user_id', user.id)
        .single();

      // If role check fails, redirect to home
      if (!roleData || !allowedRoles.includes(roleData.role)) {
        navigate('/');
        return;
      }

      // If approval is required, check vendor status
      if (requireApproval && roleData.role === 'vendor') {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('application_status')
          .eq('id', user.id)
          .single();

        if (!roleData.is_approved || profile?.application_status !== 'approved') {
          navigate('/vendor/status');
          return;
        }
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuthorization();
  }, [user, allowedRoles, requireApproval, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <>{children}</> : null;
};