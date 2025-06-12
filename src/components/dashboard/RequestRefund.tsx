
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

export const RequestRefund: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedPart, setSelectedPart] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRefundableOrders();
    }
  }, [user]);

  const fetchRefundableOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          parts (
            *,
            vehicles (make, model, year)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'closed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching refundable orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching refundable orders:', error);
    }
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder || !reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please select an order and provide a reason.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('refund_requests')
        .insert({
          user_id: user?.id,
          order_id: selectedOrder,
          part_id: selectedPart || null,
          reason: reason.trim(),
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Refund request submitted",
        description: "We will review your request and get back to you soon."
      });

      // Reset form
      setSelectedOrder('');
      setSelectedPart('');
      setReason('');
    } catch (error: any) {
      console.error('Error submitting refund request:', error);
      toast({
        title: "Error submitting refund request",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedOrderData = orders.find(order => order.id === selectedOrder);

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No completed orders</h3>
        <p className="text-gray-600">You can only request refunds for completed orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Refund</h1>
        <p className="text-gray-600">Submit a refund request for completed orders.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Refund Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRefund} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="order">Select Order</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an order to refund" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      Order #{order.id.slice(0, 8)} - {new Date(order.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrderData && (
              <div className="space-y-2">
                <Label htmlFor="part">Select Part (Optional)</Label>
                <Select value={selectedPart} onValueChange={setSelectedPart}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a specific part or leave blank for full order" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedOrderData.parts?.map((part: any) => (
                      <SelectItem key={part.id} value={part.id}>
                        {part.part_name} - {part.vehicles?.make} {part.vehicles?.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Refund</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you're requesting a refund..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Refund Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
