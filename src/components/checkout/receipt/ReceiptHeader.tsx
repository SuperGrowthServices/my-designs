
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ReceiptHeaderProps {
  orderId: string;
  isAdmin: boolean;
}

export const ReceiptHeader: React.FC<ReceiptHeaderProps> = ({ orderId, isAdmin }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <img 
          src="/placeholder.svg" 
          alt="EasyCarParts" 
          className="h-12 w-auto"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1>
          <p className="text-gray-600">Order #{orderId.slice(0, 8)}</p>
          {isAdmin && (
            <Badge variant="outline" className="mt-1">Admin View</Badge>
          )}
        </div>
      </div>
      
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Payment Successful!</h3>
              <p className="text-green-700">Your order has been confirmed and vendors have been notified.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
