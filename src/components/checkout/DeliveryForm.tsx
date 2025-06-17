import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Make sure you have this configured

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimated_days: number;
}

interface DeliveryFormProps {
  userId: string;
  deliveryAddress: string;
  onDeliveryAddressChange: (address: string) => void;
  selectedDeliveryOption: string;
  onDeliveryOptionChange: (option: string) => void;
  deliveryOptions: DeliveryOption[];
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  userId,
  deliveryAddress,
  onDeliveryAddressChange,
  selectedDeliveryOption,
  onDeliveryOptionChange,
  deliveryOptions
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        setUserProfile(data);
        // Set the initial delivery address from user profile if not already set
        if (data?.delivery_address && !deliveryAddress) {
          onDeliveryAddressChange(data.delivery_address);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleSaveAddress = async () => {
    if (!userId || !deliveryAddress) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          delivery_address: deliveryAddress 
        })
        .eq('id', userId);

      if (error) throw error;

      setIsEditing(false);
      // Refresh the user profile
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error updating delivery address:', error);
    }
  };

  const formatDeliveryOptionText = (option: DeliveryOption) => {
    const daysText = option.estimated_days === 0 ? 'Same Day' : 
                    option.estimated_days === 1 ? 'Next Day' : 
                    `${option.estimated_days} Days`;
    return `${option.name} - AED ${option.price.toFixed(2)} (${daysText})`;
  };

  if (isLoading) {
    return <div>Loading delivery information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Address */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Delivery Address</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1"
            >
              <Pencil className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </Button>
          </div>

          {!isEditing ? (
            <div className="p-4 border rounded-md bg-gray-50">
              {userProfile?.delivery_address ? (
                <p>{userProfile.delivery_address}</p>
              ) : (
                <p className="text-gray-500">No delivery address set</p>
              )}
              {userProfile?.delivery_phone && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {userProfile.delivery_phone}
                </p>
              )}
              {userProfile?.delivery_instructions && (
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Instructions:</span> {userProfile.delivery_instructions}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={deliveryAddress}
                  onChange={(e) => onDeliveryAddressChange(e.target.value)}
                  placeholder="Enter your complete delivery address including building number, street, area, and city"
                  className="min-h-[100px]"
                  required
                />
              </div>
              <Button onClick={handleSaveAddress} disabled={!deliveryAddress}>
                Save Address
              </Button>
            </div>
          )}
        </div>

        {/* Delivery Options */}
        <div className="space-y-2">
          <Label htmlFor="deliveryOption">Delivery Option</Label>
          <Select value={selectedDeliveryOption} onValueChange={onDeliveryOptionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select delivery option" />
            </SelectTrigger>
            <SelectContent>
              {deliveryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {formatDeliveryOptionText(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {deliveryOptions.length === 0 && (
            <p className="text-sm text-gray-500">Loading delivery options...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};