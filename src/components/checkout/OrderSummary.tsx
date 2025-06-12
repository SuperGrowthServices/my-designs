
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AcceptedBid {
  id: string;
  price: number;
  part_name: string;
  quantity: number;
}

interface OrderSummaryProps {
  acceptedBids: AcceptedBid[];
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ acceptedBids }) => {
  const calculateSubtotal = () => {
    return acceptedBids.reduce((total, bid) => total + (bid.price * bid.quantity), 0);
  };

  const subtotal = calculateSubtotal();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {acceptedBids.map((bid) => (
            <div key={bid.id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <h4 className="font-medium">{bid.part_name}</h4>
                <p className="text-sm text-gray-600">Qty: {bid.quantity}</p>
                {bid.quantity > 1 && (
                  <p className="text-xs text-gray-500">
                    AED {bid.price.toFixed(2)} × {bid.quantity}
                  </p>
                )}
              </div>
              <p className="font-bold text-green-600">
                AED {(bid.price * bid.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          
          {acceptedBids.length > 0 && (
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">AED {subtotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
