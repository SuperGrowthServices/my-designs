
import { useState } from 'react';

export const usePaymentRedirect = () => {
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [redirectStatus, setRedirectStatus] = useState<string>('');

  const attemptRedirect = (url: string, method: string = 'location.href') => {
    console.log(`Attempting redirect via ${method} to:`, url);
    setRedirectStatus(`Attempting redirect via ${method}...`);
    setPaymentUrl(url);
    setRedirectAttempted(true);
    
    try {
      if (method === 'location.href') {
        window.location.href = url;
      } else if (method === 'window.open') {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          throw new Error('Pop-up blocked');
        }
      } else if (method === 'location.replace') {
        window.location.replace(url);
      }
      
      setTimeout(() => {
        setRedirectStatus('Redirect may have failed - try manual link below');
      }, 3000);
      
    } catch (error) {
      console.error(`Redirect via ${method} failed:`, error);
      setRedirectStatus(`Redirect via ${method} failed`);
      
      if (method === 'location.href') {
        setTimeout(() => attemptRedirect(url, 'window.open'), 1000);
      } else if (method === 'window.open') {
        setTimeout(() => attemptRedirect(url, 'location.replace'), 1000);
      }
    }
  };

  return {
    redirectAttempted,
    paymentUrl,
    redirectStatus,
    attemptRedirect
  };
};
