import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/database';

export type Order = Tables<'orders'> & { customer_name: string };
export type UserProfile = Tables<'user_profiles'>;
export type User = {
  id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  business_name: string | null;
  whatsapp_number: string | null;
  location: string | null;
  roles: string[] | null;
};

export interface PlatformStats {
  total_users: number;
  total_vendors: number;
  total_buyers: number;
  total_orders: number;
}

export interface AdminData {
  stats: PlatformStats;
  orders: Order[];
  users: User[];
  vendorApplications: UserProfile[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

const initialStats: PlatformStats = {
  total_users: 0,
  total_vendors: 0,
  total_buyers: 0,
  total_orders: 0,
};

export const useAdminData = (): AdminData => {
  const [stats, setStats] = useState<PlatformStats>(initialStats);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendorApplications, setVendorApplications] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_admin_data');
      if (error) throw error;
      
      const result = data[0];
      if (result) {
        setStats(result.platform_stats || initialStats);
        setOrders(result.all_orders || []);
        setUsers(result.all_users || []);
        setVendorApplications(result.vendor_applications || []);
      }
    } catch (err: any) {
      setError(err);
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    orders,
    users,
    vendorApplications,
    loading,
    error,
    refresh: fetchData,
  };
}; 