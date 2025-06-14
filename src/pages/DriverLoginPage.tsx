import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const DriverLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signOut, user, loading: authLoading } = useAuth(); // Add signOut here
  const { isDriver, isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Only redirect if we have confirmed roles
  if (user && !authLoading && (isDriver || isAdmin)) {
    return <Navigate to="/driver/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await signIn(email, password);
      
      if (response.error) {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return;
      }

      // Check if user has driver role
      if (response.role !== 'driver' && response.role !== 'admin') {
        toast({
          title: "Access denied",
          description: "This portal is only for drivers",
          variant: "destructive"
        });
        // Sign out the user since they don't have access
        await signOut();
        return;
      }

      // Successfully logged in as driver
      navigate('/driver/dashboard');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Truck className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Driver Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your delivery dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full flex justify-center"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};