import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SignupConfirmationModal } from './SignupConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { SignInResponse } from '@/types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    whatsappNumber: '',
    location: ''
  });

  const handleRoleBasedNavigation = (role: string) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'vendor':
        navigate('/vendor');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error, needsConfirmation } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.whatsappNumber,
          formData.location
        );

        if (error) {
          toast({
            title: "Error creating account",
            description: error.message,
            variant: "destructive"
          });
        } else if (needsConfirmation) {
          setSignupEmail(formData.email);
          setShowConfirmation(true);
          onClose();
        } else {
          onClose();
        }
      } else {
        const response: SignInResponse = await signIn(formData.email, formData.password);
        
        if (response.error) {
          toast({
            title: "Error signing in",
            description: response.error.message,
            variant: "destructive"
          });
        } else {
          onClose();
          // Check if role exists, default to 'buyer' if not
          const userRole = response.role || 'buyer';
          handleRoleBasedNavigation(userRole);
        }
      }
    } catch (error) {
      toast({
        title: "Unexpected error",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      whatsappNumber: '',
      location: ''
    });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="text-center">
            <Button variant="link" onClick={toggleMode}>
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SignupConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        email={signupEmail}
      />
    </>
  );
};
