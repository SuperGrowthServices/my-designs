
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { DeliveryAddressManager } from '@/components/shared/DeliveryAddressManager';

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimated_days: number;
}

interface DeliveryFormProps {
  deliveryAddress: string;
  onDeliveryAddressChange: (address: string) => void;
  selectedDeliveryOption: string;
  onDeliveryOptionChange: (option: string) => void;
  deliveryOptions: DeliveryOption[];
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  deliveryAddress,
  onDeliveryAddressChange,
  selectedDeliveryOption,
  onDeliveryOptionChange,
  deliveryOptions
}) => {
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string>('');
  const [showCustomAddress, setShowCustomAddress] = useState(false);

  const handleSavedAddressSelect = (formattedAddress: string, addressData?: any) => {
    setSelectedSavedAddress(addressData?.id || '');
    setShowCustomAddress(false);
    onDeliveryAddressChange(formattedAddress);
  };

  const handleCustomAddressToggle = () => {
    setShowCustomAddress(true);
    setSelectedSavedAddress('');
  };

  const formatDeliveryOptionText = (option: DeliveryOption) => {
    const daysText = option.estimated_days === 0 ? 'Same Day' : 
                    option.estimated_days === 1 ? 'Next Day' : 
                    `${option.estimated_days} Days`;
    return `${option.name} - AED ${option.price.toFixed(2)} (${daysText})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Saved Addresses using shared component */}
        <div className="space-y-3">
          <Label>Select from saved addresses</Label>
          <DeliveryAddressManager
            selectedAddress={selectedSavedAddress}
            onAddressSelect={handleSavedAddressSelect}
            showAddressForm={false}
            compact={true}
          />
        </div>

        {/* Custom Address Option */}
        <div className="flex items-start space-x-3">
          <input
            type="radio"
            id="custom"
            name="savedAddress"
            checked={showCustomAddress}
            onChange={handleCustomAddressToggle}
            className="mt-1"
          />
          <label htmlFor="custom" className="flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Use different address</span>
          </label>
        </div>

        {/* Custom Address Form */}
        {showCustomAddress && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="customAddress">Delivery Address</Label>
              <Textarea
                id="customAddress"
                value={deliveryAddress}
                onChange={(e) => onDeliveryAddressChange(e.target.value)}
                placeholder="Enter your complete delivery address including building number, street, area, and city"
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
        )}

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
