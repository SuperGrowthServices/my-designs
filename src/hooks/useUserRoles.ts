import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
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
        setRoles([]);
      } else {
        const fetchedRoles = data?.map((r: any) => r.role) || [];
        setRoles(fetchedRoles);
        
        // If no roles found, ensure user has default buyer role
        if (fetchedRoles.length === 0) {
          console.log('No roles found, adding default buyer role');
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ user_id: user.id, role: 'buyer' });
          
          if (!insertError) {
            setRoles(['buyer']);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isVendor = (): boolean => hasRole('vendor');
  const isBuyer = (): boolean => hasRole('buyer');
  const isDeliveryDriver = (): boolean => hasRole('delivery_driver');
  const isDriver = (): boolean => hasRole('driver');

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isVendor,
    isBuyer,
    isDeliveryDriver,
    isDriver,
    refetchRoles: fetchUserRoles
  };
};
