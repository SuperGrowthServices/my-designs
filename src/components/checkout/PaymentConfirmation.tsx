
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const PaymentConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId && user) {
      verifyPayment();
    } else if (!sessionId) {
      setError('Missing payment session information');
      setVerifying(false);
    }
  }, [sessionId, user]);

  const verifyPayment = async () => {
    if (!sessionId || !user) return;

    try {
      console.log('Verifying payment with session ID:', sessionId);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId }
      });

      console.log('Payment verification response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Payment verification failed');
      }

      if (data?.success) {
        setVerified(true);
        
        // Get the order ID from the invoice
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('order_id')
          .eq('stripe_session_id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (invoiceData) {
          setOrderId(invoiceData.order_id);
        }

        toast({
          title: "Payment confirmed!",
          description: "Your order has been successfully processed.",
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setError(error.message || 'Failed to verify payment');
      toast({
        title: "Payment verification failed",
        description: error.message || "Please contact support if you were charged.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleViewReceipt = () => {
    if (orderId) {
      navigate(`/receipt/${orderId}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Verifying Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle>Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">
              If you were charged, please contact our support team with your session ID: {sessionId}
            </p>
            <Button onClick={handleBackToDashboard} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle>Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your payment has been processed successfully. Vendors have been notified and will begin preparing your order.
          </p>
          <div className="space-y-3">
            <Button onClick={handleViewReceipt} className="w-full">
              View Receipt
            </Button>
            <Button onClick={handleBackToDashboard} variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
