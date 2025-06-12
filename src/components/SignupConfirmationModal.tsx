
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';

interface SignupConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const SignupConfirmationModal: React.FC<SignupConfirmationModalProps> = ({
  isOpen,
  onClose,
  email
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Account Created Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Check Your Email</h3>
            <p className="text-gray-600">
              We've sent a confirmation email to:
            </p>
            <p className="font-medium text-blue-600">{email}</p>
            <p className="text-sm text-gray-500">
              Please click the link in the email to confirm your account before signing in.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Check your spam folder if you don't see the email within a few minutes.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={onClose} className="w-full">
            Continue to Homepage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
