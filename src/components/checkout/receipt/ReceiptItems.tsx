
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReceiptItemsProps {
  acceptedBids: any[];
}

export const ReceiptItems: React.FC<ReceiptItemsProps> = ({ acceptedBids }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ordered Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {acceptedBids.length > 0 ? (
            acceptedBids.map((bid: any) => (
              <div key={bid.id} className="flex justify-between items-start p-4 bg-gray-50 rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{bid.part_name}</h4>
                  <p className="text-sm text-gray-600">Qty: {bid.quantity}</p>
                  <p className="text-sm text-gray-600">Vendor: {bid.vendor_name}</p>
                </div>
                <p className="font-bold text-green-600">AED {Number(bid.price).toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No items found for this order.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
