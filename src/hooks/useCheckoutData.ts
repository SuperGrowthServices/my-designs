import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AcceptedBid {
  id: string;
  price: number;
  part_name: string;
  quantity: number;
}

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimated_days: number;
}

export const useCheckoutData = (orderId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [acceptedBids, setAcceptedBids] = useState<AcceptedBid[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);

  const fetchOrderDetails = async () => {
    if (!user || !orderId) return;

    try {
      console.log('Fetching order details for order:', orderId);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        throw orderError;
      }
      
      console.log('Order data:', orderData);
      setOrder(orderData);

      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('*')
        .eq('order_id', orderId);

      if (partsError) {
        console.error('Error fetching parts:', partsError);
        throw partsError;
      }

      console.log('Parts data:', partsData);
      const acceptedBidsData: AcceptedBid[] = [];
      
      for (const part of partsData || []) {
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select('id, price, status')
          .eq('part_id', part.id)
          .eq('status', 'accepted');

        if (bidsError) {
          console.error('Error fetching bids for part:', part.id, bidsError);
        } else if (bidsData) {
          console.log('Accepted bids for part', part.id, ':', bidsData);
          bidsData.forEach((bid: any) => {
            acceptedBidsData.push({
              id: bid.id,
              price: Number(bid.price),
              part_name: part.part_name,
              quantity: part.quantity
            });
          });
        }
      }

      console.log('Final accepted bids data:', acceptedBidsData);
      setAcceptedBids(acceptedBidsData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error loading order",
        description: "Unable to fetch order details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryOptions = async () => {
    try {
      console.log('Fetching delivery options...');
      
      const { data, error } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('is_active', true)
        .order('estimated_days', { ascending: true })
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching delivery options:', error);
        throw error;
      }

      console.log('Raw delivery options:', data);
      
      // Deduplicate based on estimated_days and keep the first (cheapest) option
      const uniqueOptions = data?.reduce((acc: DeliveryOption[], option) => {
        const existingOption = acc.find(opt => opt.estimated_days === option.estimated_days);
        if (!existingOption) {
          acc.push({
            id: option.id,
            name: option.name,
            price: Number(option.price),
            estimated_days: option.estimated_days
          });
        }
        return acc;
      }, []) || [];

      console.log('Deduplicated delivery options:', uniqueOptions);
      setDeliveryOptions(uniqueOptions);
    } catch (error) {
      console.error('Error fetching delivery options:', error);
      toast({
        title: "Error loading delivery options",
        description: "Unable to fetch delivery options. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
      fetchDeliveryOptions();
    }
  }, [user, orderId]);

  return {
    loading,
    order,
    acceptedBids,
    deliveryOptions
  };
};
