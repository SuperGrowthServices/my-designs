
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PickupManagement } from './PickupManagement';
import { DeliveryManagement } from './DeliveryManagement';
import { Package, Truck } from 'lucide-react';

export const DeliveryTabs: React.FC = () => {
  return (
    <Tabs defaultValue="pickups" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="pickups" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Pickups
        </TabsTrigger>
        <TabsTrigger value="deliveries" className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Deliveries
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pickups">
        <PickupManagement />
      </TabsContent>
      
      <TabsContent value="deliveries">
        <DeliveryManagement />
      </TabsContent>
    </Tabs>
  );
};
