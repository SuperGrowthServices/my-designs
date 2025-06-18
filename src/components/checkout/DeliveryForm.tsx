import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, MapPin, Phone, FileText, Map } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimated_days: number;
}

interface DeliveryInfo {
  deliveryAddress: string;
  location: string;
  contactNumber: string;
  specialInstructions: string;
  googleMapsUrl: string;
}

interface DeliveryFormProps {
  userId: string;
  deliveryInfo: DeliveryInfo;
  onDeliveryInfoChange: (info: DeliveryInfo) => void;
  selectedDeliveryOption: string;
  onDeliveryOptionChange: (option: string) => void;
  deliveryOptions: DeliveryOption[];
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  userId,
  deliveryInfo,
  onDeliveryInfoChange,
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
        
        // Set initial delivery info from user profile if not already set
        if (data && !deliveryInfo.deliveryAddress) {
          onDeliveryInfoChange({
            deliveryAddress: data.delivery_address || '',
            location: data.location || '',
            contactNumber: data.delivery_phone || '',
            specialInstructions: data.delivery_instructions || '',
            googleMapsUrl: data.google_maps_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
    onDeliveryInfoChange({
      ...deliveryInfo,
      [field]: value
    });
  };

  const handleSaveAddress = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          delivery_address: deliveryInfo.deliveryAddress,
          location: deliveryInfo.location,
          delivery_phone: deliveryInfo.contactNumber,
          delivery_instructions: deliveryInfo.specialInstructions,
          google_maps_url: deliveryInfo.googleMapsUrl
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters and the prefix if entered
    const cleaned = e.target.value.replace(/\D/g, '').replace(/^971/, '');
    onDeliveryInfoChange({
      ...deliveryInfo,
      contactNumber: cleaned
    });
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
        {/* Delivery Address Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Delivery Details</Label>
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
            <div className="p-4 border rounded-md bg-gray-50 space-y-3">
              {userProfile?.delivery_address ? (
                <>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm text-gray-700">Delivery Address</p>
                      <p className="text-sm">{userProfile.delivery_address}</p>
                    </div>
                  </div>
                  
                  {userProfile.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-700">Location</p>
                        <p className="text-sm">{userProfile.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {userProfile.delivery_phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-700">Contact Number</p>
                        <p className="text-sm">{userProfile.delivery_phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {userProfile.delivery_instructions && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-700">Special Instructions</p>
                        <p className="text-sm">{userProfile.delivery_instructions}</p>
                      </div>
                    </div>
                  )}
                  
                  {userProfile.google_maps_url && (
                    <div className="flex items-start gap-2">
                      <Map className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-700">Google Maps</p>
                        <a 
                          href={userProfile.google_maps_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Location
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No delivery information set</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Delivery Address */}
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Delivery Address *
                </Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryInfo.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  placeholder="Enter the complete delivery address"
                  className="min-h-[80px]"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location *
                </Label>
                <Input
                  id="location"
                  value={deliveryInfo.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Downtown Dubai, Business Bay"
                  required
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Delivery Contact Number *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    +971
                  </span>
                  <Input
                    id="contactNumber"
                    value={deliveryInfo.contactNumber}
                    onChange={handlePhoneChange}
                    className="pl-14"
                    placeholder="50 123 4567"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Enter your number without the country code</p>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="specialInstructions" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  value={deliveryInfo.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any specific delivery instructions (optional)"
                  className="min-h-[60px]"
                />
              </div>

              {/* Google Maps URL */}
              <div className="space-y-2">
                <Label htmlFor="googleMapsUrl" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Google Maps URL
                </Label>
                <Input
                  id="googleMapsUrl"
                  type="url"
                  value={deliveryInfo.googleMapsUrl}
                  onChange={(e) => handleInputChange('googleMapsUrl', e.target.value)}
                  placeholder="https://maps.google.com/... (optional)"
                />
              </div>

              <Button 
                onClick={handleSaveAddress} 
                disabled={!deliveryInfo.deliveryAddress || !deliveryInfo.location || !deliveryInfo.contactNumber}
                className="w-full"
              >
                Save Delivery Information
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