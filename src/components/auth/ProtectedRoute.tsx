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
    const checkAuthorization = async () => {
      if (loading) return;

      if (!user) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, is_approved')
          .eq('user_id', user.id)
          .single();

        if (!roleData || !allowedRoles.includes(roleData.role)) {
          navigate('/', { replace: true });
          return;
        }

        if (requireApproval && roleData.role === 'vendor') {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('application_status')
            .eq('id', user.id)
            .single();

          if (!roleData.is_approved || profile?.application_status !== 'approved') {
            navigate('/vendor/status', { replace: true });
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/', { replace: true });
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthorization();
  }, [user, loading, allowedRoles, requireApproval, navigate]);

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return isAuthorized ? children : null;
};