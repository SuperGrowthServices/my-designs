
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReceiptDetailsProps {
  invoice: any;
  order: any;
}

export const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({ invoice, order }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Receipt Details</CardTitle>
            <p className="text-sm text-gray-600">
              Payment Date: {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <Badge variant="default">Paid</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Information */}
          <div>
            <h4 className="font-medium mb-3">Order Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span>#{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span>Stripe</span>
              </div>
              {invoice.stripe_payment_intent_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="text-xs">{invoice.stripe_payment_intent_id.slice(0, 20)}...</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h4 className="font-medium mb-3">Delivery Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Option:</span>
                <span>{invoice.delivery_option?.name || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span>
                  {invoice.delivery_option?.estimated_days === 0 
                    ? 'Same day' 
                    : invoice.delivery_option?.estimated_days
                    ? `${invoice.delivery_option.estimated_days} days`
                    : 'Standard delivery'
                  }
                </span>
              </div>
              {invoice.delivery_address && (
                <div className="text-gray-600">
                  <span className="block">Address:</span>
                  <span className="text-gray-900">{invoice.delivery_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
