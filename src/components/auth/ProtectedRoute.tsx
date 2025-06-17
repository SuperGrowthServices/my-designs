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
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        if (loading || !user) {
          if (!loading && mounted) {
            navigate('/', { replace: true });
          }
          return;
        }

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, is_approved')
          .eq('user_id', user.id)
          .single();

        if (!mounted) return;

        if (roleError || !roleData || !allowedRoles.includes(roleData.role)) {
          navigate('/', { replace: true });
          return;
        }

        // Check approval status for vendors
        if (requireApproval && roleData.role === 'vendor') {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('application_status')
            .eq('id', user.id)
            .single();

          if (!mounted) return;

          if (!roleData.is_approved || profile?.application_status !== 'approved') {
            navigate('/vendor/status', { replace: true });
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          navigate('/', { replace: true });
        }
      } finally {
        if (mounted) {
          setAuthCheckComplete(true);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [user, loading, allowedRoles, navigate, requireApproval]);

  if (loading || !authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};