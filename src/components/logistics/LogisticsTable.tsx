import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UpdatePartStatusModal } from './UpdatePartStatusModal'; // Will be created next

// Type definitions based on the get_logistics_data function
export interface PartForLogistics {
  part_id: string;
  part_name: string;
  quantity: number;
  order_id: string;
  order_created_at: string;
  current_status: 'pending_pickup' | 'collected' | 'admin_collected' | 'delivered';
  delivery_info: {
    option_name: string | null;
    estimated_days: number | null;
    delivery_address: string;
    delivery_instructions: string | null;
    customer_name: string;
    whatsapp_number: string | null;
    google_maps_url: string | null;
  };
  vendor_info: {
    name: string;
    whatsapp_number: string | null;
    pickup_address: string;
    google_maps_url: string | null;
  } | null;
}

interface GroupData {
  parts: PartForLogistics[];
  contact_name: string | null;
  whatsapp_number: string | null;
  google_maps_url: string | null;
  delivery_instructions: string | null;
}

type OrderGroups = Record<string, GroupData>;
type DeliveryTypeGroups = Record<string, OrderGroups>;
export type AddressGroups = Record<string, DeliveryTypeGroups>;

export const LogisticsTable: React.FC = () => {
  const [parts, setParts] = useState<PartForLogistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<PartForLogistics | null>(null);

  const fetchLogisticsData = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await (supabase.rpc as any)('get_logistics_data');
    
    if (error) {
      console.error('Error fetching logistics data:', error);
      setError('Failed to fetch logistics data.');
    } else {
      setParts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const { pickupGroups, deliveryGroups } = useMemo(() => {
    const pickupParts = parts.filter(p => p.current_status === 'pending_pickup');
    const deliveryParts = parts.filter(p => p.current_status === 'collected' || p.current_status === 'admin_collected');

    const groupForPickup = (arr: PartForLogistics[]): AddressGroups =>
      arr.reduce((acc: AddressGroups, part) => {
        const address = part.vendor_info?.pickup_address || 'Unknown Pickup Address';
        if (!acc[address]) acc[address] = {};
        
        const vendorName = part.vendor_info?.name || 'Unknown Vendor';
        if (!acc[address][vendorName]) acc[address][vendorName] = {};

        const orderId = part.order_id;
        if (!acc[address][vendorName][orderId]) {
          acc[address][vendorName][orderId] = {
            parts: [],
            contact_name: part.vendor_info?.name,
            whatsapp_number: part.vendor_info?.whatsapp_number,
            google_maps_url: part.vendor_info?.google_maps_url,
            delivery_instructions: null, // Not applicable for pickup
          };
        }
        acc[address][vendorName][orderId].parts.push(part);
        return acc;
      }, {});

    const groupForDelivery = (arr: PartForLogistics[]): AddressGroups =>
      arr.reduce((acc: AddressGroups, part) => {
        const address = part.delivery_info?.delivery_address || 'Unknown Delivery Address';
        if (!acc[address]) acc[address] = {};

        const deliveryType = part.delivery_info?.option_name || 'Standard Delivery';
        if (!acc[address][deliveryType]) acc[address][deliveryType] = {};
        
        const orderId = part.order_id;
        if (!acc[address][deliveryType][orderId]) {
          acc[address][deliveryType][orderId] = {
            parts: [],
            contact_name: part.delivery_info?.customer_name,
            whatsapp_number: part.delivery_info?.whatsapp_number,
            google_maps_url: part.delivery_info?.google_maps_url,
            delivery_instructions: part.delivery_info?.delivery_instructions,
          };
        }
        acc[address][deliveryType][orderId].parts.push(part);
        return acc;
      }, {});

    return {
      pickupGroups: groupForPickup(pickupParts),
      deliveryGroups: groupForDelivery(deliveryParts),
    };
  }, [parts]);

  if (loading) { /* ... loading UI ... */ }
  if (error) { /* ... error UI ... */ }

  const renderPartRow = (part: PartForLogistics, prefix: string) => (
    <div key={`${prefix}-${part.part_id}`} className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
      <div>
        <p className="font-semibold">{part.part_name} (x{part.quantity})</p>
        <p className="text-sm text-muted-foreground">Order #{part.order_id.substring(0, 8)}</p>
        {(part.current_status === 'collected' || part.current_status === 'admin_collected') && <p className="text-sm">To: {part.delivery_info.customer_name}</p>}
      </div>
      <Button variant="outline" onClick={() => setSelectedPart(part)}>Update Status</Button>
    </div>
  );
  
  const renderGroup = (groups: AddressGroups, prefix: string) => (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {Object.entries(groups).map(([address, deliveryTypeGroups]) => {
        const topLevelData = Object.values(Object.values(deliveryTypeGroups)[0])[0];
        
        return (
          <AccordionItem value={`${prefix}-${address}`} key={`${prefix}-${address}`} className="bg-gray-50 rounded-lg">
            <AccordionTrigger className="p-4 w-full">
              <div className="flex-1 text-left">
                <p className="font-bold text-lg">{topLevelData.contact_name}</p>
                <p>{address}</p>
                 {topLevelData.delivery_instructions && <p className="text-sm text-muted-foreground mt-1">Instructions: {topLevelData.delivery_instructions}</p>}
                <div className="flex items-center gap-2 mt-2">
                    {topLevelData.google_maps_url && <Button size="sm" variant="outline" asChild><a href={topLevelData.google_maps_url} target="_blank">Maps</a></Button>}
                    {topLevelData.whatsapp_number && <Button size="sm" variant="outline" asChild><a href={`https://wa.me/${topLevelData.whatsapp_number}`} target="_blank">WhatsApp</a></Button>}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              {Object.entries(deliveryTypeGroups).map(([deliveryType, orderGroups]) => (
                  <div key={`${prefix}-${address}-${deliveryType}`} className="mt-2">
                      <p className="font-semibold text-md pl-1">{deliveryType}</p>
                      <Accordion type="multiple" className="w-full space-y-2 mt-1">
                        {Object.entries(orderGroups).map(([orderId, orderData]) => {
                            const deliverByDate = new Date(orderData.parts[0].order_created_at);
                            deliverByDate.setDate(deliverByDate.getDate() + (orderData.parts[0].delivery_info.estimated_days || 1));
                            
                            return (
                                <AccordionItem value={`${prefix}-${orderId}`} key={`${prefix}-${orderId}`} className="bg-white rounded-md">
                                    <AccordionTrigger className="px-3 py-2">
                                        <div className="flex justify-between w-full pr-2">
                                            <span>Order #{orderId.substring(0,8)} ({orderData.parts.length} parts)</span>
                                            {orderData.parts[0].delivery_info.estimated_days !== null && (
                                              <span className="text-sm text-muted-foreground">Deliver By: {deliverByDate.toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-3 pb-2">
                                        <div className="space-y-2">
                                            {orderData.parts.map(part => renderPartRow(part, prefix))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                      </Accordion>
                  </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Tabs defaultValue="pickup">
        <TabsList>
          <TabsTrigger value="pickup">Pick-up ({Object.keys(pickupGroups).length})</TabsTrigger>
          <TabsTrigger value="delivering">Delivering ({Object.keys(deliveryGroups).length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pickup" className="mt-4">
          {Object.keys(pickupGroups).length > 0 ? renderGroup(pickupGroups, 'pickup') : <p className="text-center py-8 text-gray-500">No parts are currently waiting for pickup.</p>}
        </TabsContent>
        <TabsContent value="delivering" className="mt-4">
          {Object.keys(deliveryGroups).length > 0 ? renderGroup(deliveryGroups, 'delivering') : <p className="text-center py-8 text-gray-500">No parts are currently out for delivery.</p>}
        </TabsContent>
      </Tabs>
      <UpdatePartStatusModal
        part={selectedPart}
        isOpen={!!selectedPart}
        onClose={() => setSelectedPart(null)}
        onSuccess={fetchLogisticsData}
      />
    </div>
  );
}; 