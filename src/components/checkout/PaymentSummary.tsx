import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PaymentSummaryProps {
  subtotal: number;
  vatAmount: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  acceptedBidsCount: number;
  processing: boolean;
  redirectAttempted: boolean;
  redirectStatus: string;
  deliveryAddress: string;
  selectedDeliveryOption: string;
  deliveryOptions: Array<{id: string; name: string; price: number; estimated_days: number}>;
  onPayment: () => void;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  subtotal,
  vatAmount,
  serviceFee,
  deliveryFee,
  total,
  acceptedBidsCount,
  processing,
  redirectAttempted,
  redirectStatus,
  deliveryAddress,
  selectedDeliveryOption,
  deliveryOptions,
  onPayment
}) => {
  const selectedOption = deliveryOptions.find(opt => opt.id === selectedDeliveryOption);
  
  const formatDeliveryOptionName = (option: any) => {
    if (!option) return '';
    const daysText = option.estimated_days === 0 ? 'Same Day' : 
                    option.estimated_days === 1 ? 'Next Day' : 
                    `${option.estimated_days} Days`;
    return `${option.name} (${daysText})`;
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal ({acceptedBidsCount} item{acceptedBidsCount > 1 ? 's' : ''})</span>
            <span>AED {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>VAT (5%)</span>
            <span>AED {vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service Fee (5%)</span>
            <span>AED {serviceFee.toFixed(2)}</span>
          </div>
          {selectedDeliveryOption && selectedOption && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Delivery - {formatDeliveryOptionName(selectedOption)}
              </span>
              <span>AED {deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>AED {total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          onClick={onPayment}
          disabled={
            processing || 
            !deliveryAddress?.trim() ||  // Check if address is empty/not selected
            !selectedDeliveryOption || 
            redirectAttempted
          }
          className={`w-full mt-6 ${
            !deliveryAddress?.trim() 
              ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          size="lg"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {redirectStatus || 'Processing...'}
            </>
          ) : redirectAttempted ? (
            'Payment Session Created'
          ) : !deliveryAddress?.trim() ? (
            'Please Select Delivery Address'
          ) : (
            'Pay with Stripe'
          )}
        </Button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          {redirectAttempted 
            ? 'Use the payment link above if redirect failed'
            : 'You will be redirected to Stripe for secure payment processing'
          }
        </p>
      </CardContent>
    </Card>
  );
};
