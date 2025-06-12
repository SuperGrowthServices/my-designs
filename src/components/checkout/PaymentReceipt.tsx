
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { ReceiptHeader } from './receipt/ReceiptHeader';
import { ReceiptDetails } from './receipt/ReceiptDetails';
import { ReceiptItems } from './receipt/ReceiptItems';
import { ReceiptSummary } from './receipt/ReceiptSummary';
import { ReceiptActions } from './receipt/ReceiptActions';

interface ReceiptData {
  invoice: any;
  order: any;
  parts: any[];
  acceptedBids: any[];
}

export const PaymentReceipt: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    if (user && orderId && !rolesLoading) {
      fetchReceiptData();
    } else if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view receipts.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [user, orderId, rolesLoading]);

  const fetchReceiptData = async () => {
    if (!user || !orderId) return;

    try {
      console.log('Fetching receipt data for order:', orderId, 'user:', user.id, 'isAdmin:', isAdmin());

      // Build the order query - admins can view any order, regular users only their own
      let orderQuery = supabase
        .from('orders')
        .select('*')
        .eq('id', orderId);

      // Only restrict to user's orders if they're not an admin
      if (!isAdmin()) {
        orderQuery = orderQuery.eq('user_id', user.id);
      }

      const { data: orderData, error: orderError } = await orderQuery.maybeSingle();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        throw new Error('Failed to fetch order details');
      }

      if (!orderData) {
        console.log('Order not found or no permission to view');
        toast({
          title: "Order not found",
          description: isAdmin() 
            ? "This order doesn't exist." 
            : "This order doesn't exist or you don't have permission to view it.",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Build the invoice query - admins can view any invoice, regular users only their own
      let invoiceQuery = supabase
        .from('invoices')
        .select(`
          *,
          delivery_option:delivery_option_id (
            name,
            estimated_days
          )
        `)
        .eq('order_id', orderId)
        .eq('payment_status', 'paid');

      // Only restrict to user's invoices if they're not an admin
      if (!isAdmin()) {
        invoiceQuery = invoiceQuery.eq('user_id', user.id);
      }

      const { data: invoiceData, error: invoiceError } = await invoiceQuery.maybeSingle();

      if (invoiceError) {
        console.error('Error fetching invoice:', invoiceError);
        throw new Error('Failed to fetch invoice details');
      }

      if (!invoiceData) {
        console.log('No paid invoice found for this order');
        toast({
          title: "Receipt not available",
          description: "No paid invoice found for this order.",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Fetch parts for this order
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('*')
        .eq('order_id', orderId);

      if (partsError) {
        console.error('Error fetching parts:', partsError);
        throw new Error('Failed to fetch parts details');
      }

      // Get accepted bids for each part
      const acceptedBidsData = [];
      if (partsData && partsData.length > 0) {
        for (const part of partsData) {
          const { data: bidsData, error: bidsError } = await supabase
            .from('bids')
            .select('id, price')
            .eq('part_id', part.id)
            .eq('status', 'accepted');

          if (!bidsError && bidsData && bidsData.length > 0) {
            acceptedBidsData.push(...bidsData.map((bid: any, index: number) => ({
              ...bid,
              part_name: part.part_name,
              quantity: part.quantity,
              vendor_name: `Vendor ${index + 1}` // Keep vendor anonymous
            })));
          }
        }
      }

      console.log('Successfully fetched receipt data');
      setReceiptData({
        invoice: invoiceData,
        order: orderData,
        parts: partsData || [],
        acceptedBids: acceptedBidsData
      });
    } catch (error: any) {
      console.error('Error fetching receipt data:', error);
      toast({
        title: "Error loading receipt",
        description: error.message || "Unable to fetch receipt details. Please try again.",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading receipt...</div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Receipt not found</h2>
          <p className="text-gray-600 mb-4">Unable to find receipt for this order.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const { invoice, order, acceptedBids } = receiptData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ReceiptHeader orderId={order.id} isAdmin={isAdmin()} />
        <ReceiptDetails invoice={invoice} order={order} />
        <ReceiptItems acceptedBids={acceptedBids} />
        <ReceiptSummary invoice={invoice} />
        <ReceiptActions />
      </div>
    </div>
  );
};
