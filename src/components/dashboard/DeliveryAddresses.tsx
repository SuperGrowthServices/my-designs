
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryAddressManager } from '@/components/shared/DeliveryAddressManager';

interface DeliveryAddressesProps {
  onAddressUpdate?: () => void;
}

export const DeliveryAddresses: React.FC<DeliveryAddressesProps> = ({ onAddressUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        <DeliveryAddressManager
          showAddressForm={true}
          onAddressUpdate={onAddressUpdate}
        />
      </CardContent>
    </Card>
  );
};
