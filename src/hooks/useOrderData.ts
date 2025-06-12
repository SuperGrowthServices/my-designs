import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderData = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  const fetchOrders = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log('No user found, skipping order fetch');
      return;
    }

    // Implement smart caching - only fetch if it's been more than 30 seconds or forced
    const now = Date.now();
    const cacheExpiry = 30 * 1000; // 30 seconds
    
    if (!forceRefresh && lastFetchTime && (now - lastFetchTime) < cacheExpiry) {
      console.log('Using cached order data');
      return;
    }

    setLoading(true);
    try {
      console.log('=== FETCHING ORDERS ===');
      console.log('User ID:', user.id);
      
      // Single optimized query with all necessary JOINs
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          is_paid,
          parts (
            id,
            part_name,
            quantity,
            description,
            part_number,
            vehicles (
              make,
              model,
              year
            ),
            bids (
              id,
              price,
              status,
              notes,
              image_url,
              vendor_id,
              created_at,
              updated_at
            )
          ),
          invoices (
            delivery_option_id,
            delivery_options (
              name,
              estimated_days,
              price
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Raw orders data:', ordersData);

      // Process orders to add hasAcceptedBids flag and delivery priority
      const processedOrders = ordersData?.map(order => {
        const deliveryOption = order.invoices?.[0]?.delivery_options;
        const urgencyScore = getUrgencyScore(deliveryOption?.estimated_days || 999);
        
        const totalBids = order.parts?.reduce((sum: number, part: any) => sum + (part.bids?.length || 0), 0) || 0;

        // Check for accepted bids with detailed logging
        const hasAcceptedBids = order.parts?.some((part: any) => {
          const acceptedBidsCount = part.bids?.filter((bid: any) => bid.status === 'accepted').length || 0;
          console.log(`Part ${part.id} has ${acceptedBidsCount} accepted bids out of ${part.bids?.length || 0} total bids`);
          return acceptedBidsCount > 0;
        }) || false;

        console.log(`Order ${order.id} has accepted bids:`, hasAcceptedBids);
        
        return {
          ...order,
          totalBids,
          hasAcceptedBids,
          deliveryPriority: urgencyScore,
          deliveryOption: deliveryOption
        };
      }) || [];

      // Sort by delivery priority (most urgent first)
      processedOrders.sort((a, b) => a.deliveryPriority - b.deliveryPriority);

      // --- NEW: Calculate summary data for notifications ---
      let totalPendingBids = 0;
      let ordersWithPendingBids = new Set();
      processedOrders.forEach(order => {
        order.parts?.forEach((part: any) => {
          const pendingCount = part.bids?.filter((bid: any) => bid.status === 'pending').length || 0;
          if (pendingCount > 0) {
            totalPendingBids += pendingCount;
            ordersWithPendingBids.add(order.id);
          }
        });
      });

      console.log('=== PROCESSED ORDERS ===');
      console.log('Total orders:', processedOrders.length);
      console.log('Orders with accepted bids:', processedOrders.filter(o => o.hasAcceptedBids).length);

      setOrders(processedOrders);
      setLastFetchTime(now);
    } catch (error) {
      console.error('=== ORDER FETCH ERROR ===');
      console.error('Error in fetchOrders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user, lastFetchTime]);

  const getUrgencyScore = (estimatedDays: number): number => {
    if (estimatedDays === 0) return 1; // Same day - highest priority
    if (estimatedDays === 1) return 2; // Next day - medium priority
    return 3; // 2+ days - lowest priority
  };

  // Auto-fetch on user change
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  // Manual refresh function (forces cache invalidation)
  const refetchOrders = useCallback(() => {
    console.log('=== MANUALLY REFETCHING ORDERS ===');
    fetchOrders(true);
  }, [fetchOrders]);

  // --- MODIFIED: Return summary data from hook ---
  const summary = {
    totalPendingBids: 0,
    ordersWithPendingBidsCount: 0
  };

  if (orders.length > 0) {
    let pendingBids = 0;
    let ordersWithPending = new Set();
    orders.forEach(order => {
        order.parts?.forEach((part: any) => {
            const pendingCount = part.bids?.filter((bid: any) => bid.status === 'pending').length || 0;
            if (pendingCount > 0) {
                pendingBids += pendingCount;
                ordersWithPending.add(order.id);
            }
        });
    });
    summary.totalPendingBids = pendingBids;
    summary.ordersWithPendingBidsCount = ordersWithPending.size;
  }

  return {
    orders,
    loading,
    summary,
    fetchOrders: () => fetchOrders(true), // Manual fetch function (forces refresh)
    refetchOrders // Manual refresh function
  };
};
