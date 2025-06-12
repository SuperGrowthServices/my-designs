import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            parts (
              id,
              part_name,
              description,
              part_number,
              quantity,
              vehicle:vehicles (
                id,
                make,
                model,
                year,
                vin
              ),
              bids (
                id,
                price,
                notes,
                status,
                vendor_id,
                vendor:vendor_id (
                  full_name,
                  business_name
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        const liveOrdersData = ordersData?.filter(order => 
          ['open', 'ready_for_checkout'].includes(order.status)
        ) || [];

        const processedOrders = liveOrdersData.map(order => {
          const partsWithDetails = order.parts.map(part => ({
            ...part,
            vehicle: part.vehicle,
            bids: part.bids || []
          }));

          const hasAcceptedBids = partsWithDetails.some(part => 
            part.bids.some((bid: any) => bid.status === 'accepted')
          );

          return {
            ...order,
            parts: partsWithDetails,
            hasAcceptedBids
          };
        });

        setLiveOrders(processedOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error loading dashboard",
          description: "Unable to fetch dashboard data. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  return { 
    liveOrders, 
    loading
  };
};
