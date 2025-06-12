import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { OrderCard_Design } from './orders/OrderCard_Design';
import { Order } from '@/data/mockDashboardData';

interface MyOrdersProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
}

export const MyOrders_Design: React.FC<MyOrdersProps> = ({ orders, onUpdateOrder }) => {
  // The checkout button will be inside the OrderCard, so this component just renders the list.

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders found.</h3>
        <p className="text-gray-600">All orders have been moved to your order history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard_Design 
          key={order.id} 
          order={order} 
          onUpdateOrder={onUpdateOrder}
        />
      ))}
    </div>
  );
}; 