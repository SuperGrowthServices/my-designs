
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink } from 'lucide-react';

interface PaymentRedirectAlertProps {
  redirectStatus: string;
  paymentUrl: string;
  attemptRedirect: (url: string, method?: string) => void;
}

export const PaymentRedirectAlert: React.FC<PaymentRedirectAlertProps> = ({
  redirectStatus,
  paymentUrl,
  attemptRedirect
}) => {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Clock className="h-5 w-5" />
          Payment Redirect
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-blue-600">{redirectStatus}</p>
          
          {paymentUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">If redirect didn't work, click here:</p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => attemptRedirect(paymentUrl, 'location.href')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Payment (Same Tab)
                </Button>
                <Button 
                  onClick={() => attemptRedirect(paymentUrl, 'window.open')}
                  variant="outline"
                >
                  Open Payment in New Tab
                </Button>
                <a 
                  href={paymentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                >
                  Manual Link to Payment <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
