import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OrderSummary } from './OrderSummary';
import { DeliveryForm } from './DeliveryForm';
import { PaymentSummary } from './PaymentSummary';
import { PaymentRedirectAlert } from './PaymentRedirectAlert';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import { usePaymentRedirect } from '@/hooks/usePaymentRedirect';

export const CheckoutPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { loading, order, acceptedBids, deliveryOptions } = useCheckoutData(orderId);
  const { 
    redirectAttempted, 
    paymentUrl, 
    redirectStatus, 
    attemptRedirect 
  } = usePaymentRedirect();

  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  const calculateTotals = () => {
    const subtotal = acceptedBids.reduce((sum, bid) => sum + bid.price, 0);
    const vatAmount = subtotal * 0.05;
    const serviceFee = subtotal * 0.05;
    
    const selectedOption = deliveryOptions.find(opt => opt.id === selectedDeliveryOption);
    const deliveryFee = selectedOption ? selectedOption.price : 0;
    
    const total = subtotal + vatAmount + serviceFee + deliveryFee;

    return { subtotal, vatAmount, serviceFee, deliveryFee, total };
  };

  const handlePayment = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Missing delivery address",
        description: "Please enter your delivery address.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDeliveryOption) {
      toast({
        title: "Missing delivery option",
        description: "Please select a delivery option.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    console.log('Starting payment process for order:', orderId);

    try {
      const totals = calculateTotals();
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user!.id,
          order_id: orderId,
          delivery_address: deliveryAddress,
          delivery_option_id: selectedDeliveryOption,
          subtotal: totals.subtotal,
          vat_amount: totals.vatAmount,
          service_fee: totals.serviceFee,
          delivery_fee: totals.deliveryFee,
          total_amount: totals.total,
          payment_status: 'unpaid'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const checkoutPayload = {
        invoice_id: invoiceData.id,
        amount: Math.round(totals.total * 100),
        currency: 'aed'
      };

      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-checkout', {
        body: checkoutPayload
      });

      if (stripeError) throw stripeError;

      if (stripeData?.url) {
        toast({
          title: "Payment session created",
          description: "Redirecting to Stripe for secure payment...",
        });

        attemptRedirect(stripeData.url);
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment error",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading checkout...</div>;
  }

  if (!order || acceptedBids.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">No items ready for checkout</h2>
          <p className="text-gray-600 mb-4">This order has no accepted bids to checkout.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/placeholder.svg" 
              alt="EasyCarParts" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EasyCarParts Checkout</h1>
              <p className="text-gray-600">Order #{order?.id?.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {redirectAttempted && (
          <PaymentRedirectAlert 
            redirectStatus={redirectStatus}
            paymentUrl={paymentUrl}
            attemptRedirect={attemptRedirect}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <OrderSummary acceptedBids={acceptedBids} />
            <DeliveryForm 
              userId={user?.id} // Pass the user ID to DeliveryForm
              deliveryAddress={deliveryAddress}
              onDeliveryAddressChange={setDeliveryAddress}
              selectedDeliveryOption={selectedDeliveryOption}
              onDeliveryOptionChange={setSelectedDeliveryOption}
              deliveryOptions={deliveryOptions}
            />
          </div>

          <div>
            <PaymentSummary 
              {...totals}
              acceptedBidsCount={acceptedBids.length}
              processing={processing}
              redirectAttempted={redirectAttempted}
              redirectStatus={redirectStatus}
              deliveryAddress={deliveryAddress}
              selectedDeliveryOption={selectedDeliveryOption}
              deliveryOptions={deliveryOptions}
              onPayment={handlePayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};