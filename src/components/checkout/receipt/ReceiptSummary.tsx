
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReceiptSummaryProps {
  invoice: any;
}

export const ReceiptSummary: React.FC<ReceiptSummaryProps> = ({ invoice }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>AED {Number(invoice.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>VAT (5%):</span>
            <span>AED {Number(invoice.vat_amount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service Fee (5%):</span>
            <span>AED {Number(invoice.service_fee || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery Fee:</span>
            <span>AED {Number(invoice.delivery_fee || 0).toFixed(2)}</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Paid:</span>
            <span>AED {Number(invoice.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
