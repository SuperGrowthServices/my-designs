
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrderSummaryCardProps {
  order: any;
  onProceedToCheckout: (orderId: string) => void;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ 
  order, 
  onProceedToCheckout 
}) => {
  const partsCount = order.parts?.length || 0;
  
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium">Order #{order.id.slice(0, 8)}</h4>
          <p className="text-sm text-gray-600">
            {partsCount} part{partsCount !== 1 ? 's' : ''} • Created {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={order.status === 'open' ? 'default' : 'secondary'}>
            {order.status === 'ready_for_checkout' ? 'Ready' : order.status}
          </Badge>
          {order.hasAcceptedBids && (
            <Button 
              size="sm"
              onClick={() => onProceedToCheckout(order.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Checkout
            </Button>
          )}
        </div>
      </div>
      
      {order.parts?.slice(0, 2).map((part: any) => (
        <div key={part.id} className="text-sm text-gray-600 mb-1">
          • {part.part_name} ({part.vehicles?.make} {part.vehicles?.model})
        </div>
      ))}
      
      {partsCount > 2 && (
        <div className="text-sm text-gray-500">
          +{partsCount - 2} more part{partsCount - 2 !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
