import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, ChevronDown, Car, Package, CheckCircle, Hourglass, ShoppingCart } from 'lucide-react';
import { BidsList } from './BidsList';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: any;
  onProceedToCheckout: (orderId: string) => void;
  onBidUpdate?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onProceedToCheckout, onBidUpdate }) => {
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      if (error) throw error;
      toast({ title: "Order cancelled", description: "Your order has been successfully cancelled." });
      if (onBidUpdate) onBidUpdate();
    } catch (error: any) {
      toast({ title: "Error cancelling order", description: error.message, variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  const hasPendingBids = (order.parts || []).some((part: any) =>
    (part.bids || []).some((bid: any) => bid.status === 'pending')
  );

  const getOrderStatus = () => {
    if (order.status === 'completed') return { label: 'Completed', icon: CheckCircle, color: 'bg-gray-100 text-gray-800' };
    if (order.hasAcceptedBids) return { label: 'Ready for Checkout', icon: ShoppingCart, color: 'bg-green-100 text-green-800' };
    if (order.totalBids > 0) return { label: 'Review Bids', icon: Hourglass, color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'New Order', icon: Package, color: 'bg-blue-100 text-blue-800' };
  };

  const status = getOrderStatus();
  const StatusIcon = status.icon;

  const uniqueVehicles = (order.parts || []).reduce((acc: any, part: any) => {
    if (part.vehicles) {
      const vehicleKey = `${part.vehicles.make}-${part.vehicles.model}-${part.vehicles.year}`;
      if (!acc[vehicleKey]) {
        acc[vehicleKey] = part.vehicles;
      }
    }
    return acc;
  }, {});

  const vehicles = Object.values(uniqueVehicles);
  const vehicleDisplay = vehicles.map((v: any) => v.make).join(', ') || 'Order';

  const partsByVehicle = (order.parts || []).reduce((acc: any, part: any) => {
    const vehicleTitle = part.vehicles
      ? `${part.vehicles.make} ${part.vehicles.model} ${part.vehicles.year}`
      : 'General Parts';
    if (!acc[vehicleTitle]) {
      acc[vehicleTitle] = [];
    }
    acc[vehicleTitle].push(part);
    return acc;
  }, {});

  return (
    <Card className="mb-4 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg border">
      <CardHeader className="p-4 cursor-pointer bg-gray-50/50 hover:bg-gray-100/60" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Car className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <h3 className="font-semibold text-lg truncate">{vehicleDisplay}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="text-xs">#{order.id.slice(0, 8)}</span>
              <span className="text-xs">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              {order.hasAcceptedBids && hasPendingBids && (
                <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1.5 text-xs">
                  <Hourglass className="w-3 h-3" />
                  Review Bids
                </Badge>
              )}
              <Badge className={`${status.color} flex items-center gap-1.5 text-xs`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-4 border-t animate-fade-in-down">
          <div className="space-y-6">
            {Object.entries(partsByVehicle).map(([vehicleTitle, parts]: [string, any[]]) => (
              <div key={vehicleTitle}>
                <h4 className="font-semibold mb-3 text-gray-800">{vehicleTitle}</h4>
                <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                  {parts.map((part: any) => (
                    <div key={part.id} className="p-4 rounded-lg bg-white border">
                      <div className="font-medium">{part.part_name}</div>
                      <div className="text-sm text-gray-500 mb-3">Qty: {part.quantity}</div>
                      <BidsList bids={part.bids || []} onBidUpdate={onBidUpdate} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t">
            {order.hasAcceptedBids && (
              <Button onClick={() => onProceedToCheckout(order.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                Proceed to Checkout
              </Button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <X className="w-4 h-4 mr-2" /> Cancel Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will cancel the entire order and remove all associated bids. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelOrder} disabled={cancelling} className="bg-red-600 hover:bg-red-700">
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
