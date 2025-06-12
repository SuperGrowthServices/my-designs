
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRoles = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get all roles from user_roles table using the RPC function
      const { data, error } = await supabase
        .rpc('get_user_roles', { check_user_id: user.id });

      if (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
      } else {
        const roles = data?.map((r: any) => r.role) || [];
        setUserRoles(roles);
        
        // If no roles found, ensure user has default buyer role
        if (roles.length === 0) {
          console.log('No roles found, adding default buyer role');
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ user_id: user.id, role: 'buyer' });
          
          if (!insertError) {
            setUserRoles(['buyer']);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isVendor = (): boolean => hasRole('vendor');
  const isBuyer = (): boolean => hasRole('buyer');
  const isDeliveryDriver = (): boolean => hasRole('delivery_driver');

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  return {
    userRoles,
    loading,
    hasRole,
    isAdmin,
    isVendor,
    isBuyer,
    isDeliveryDriver,
    refetchRoles: fetchUserRoles
  };
};
