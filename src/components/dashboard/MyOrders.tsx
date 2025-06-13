import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { OrderCard } from './orders/OrderCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MyOrdersProps {
  className?: string;
  orders: any[];
  loading: boolean;
  refetchOrders: () => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ className, orders, loading, refetchOrders }) => {
  const navigate = useNavigate();

  const handleProceedToCheckout = (orderId: string) => {
    navigate(`/checkout/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders found.</h3>
        <p className="text-gray-600">Create a new order to get started.</p>
      </div>
    );
  }
  
  const ordersWithAcceptedBids = orders.filter(order => order.hasAcceptedBids);

  return (
    <div className={cn("space-y-6", className)}>
      {/* {ordersWithAcceptedBids.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            You have {ordersWithAcceptedBids.length} order{ordersWithAcceptedBids.length !== 1 ? 's' : ''} ready for checkout!
          </AlertDescription>
        </Alert>
      )} */}

      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onProceedToCheckout={handleProceedToCheckout}
            onBidUpdate={refetchOrders}
          />
        ))}
      </div>
    </div>
  );
};
