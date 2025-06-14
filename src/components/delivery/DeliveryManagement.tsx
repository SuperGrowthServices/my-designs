import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { Package, Truck, MapPin, Clock, Check } from 'lucide-react';

interface CollectedPart {
  id: string;
  part_name: string;
  quantity: number;
  part_number: string;
  shipping_status: string;
  collected_at: string;
  order: {
    id: string;
    user_id: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  pickup_notes: {
    notes: string;
    vendor: {
      full_name: string;
      business_name: string;
    };
  } | null;
}

interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  phone: string;
  instructions?: string;
  google_maps_url?: string;
  is_default: boolean;
}

export const DeliveryManagement: React.FC = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();
  const [collectedParts, setCollectedParts] = useState<CollectedPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      fetchCollectedParts();
    }
  }, [isAdmin]);

  const fetchCollectedParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select(`
          id,
          part_name,
          quantity,
          part_number,
          shipping_status,
          collected_at,
          order:orders (
            id,
            user_id
          ),
          vehicle:vehicles (
            make,
            model,
            year
          ),
          pickup_notes (
            notes,
            vendor:user_profiles!pickup_notes_vendor_id_fkey (
              full_name,
              business_name
            )
          )
        `)
        .eq('shipping_status', 'collected')
        .order('collected_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface, handling null pickup_notes
      const transformedData = (data || []).map(part => ({
        ...part,
        pickup_notes: part.pickup_notes && Array.isArray(part.pickup_notes) && part.pickup_notes.length > 0 
          ? part.pickup_notes[0] 
          : null
      }));
      
      setCollectedParts(transformedData);
    } catch (error) {
      console.error('Error fetching collected parts:', error);
      toast({
        title: "Error loading parts",
        description: "Unable to fetch collected parts data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryAddresses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_delivery_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setDeliveryAddresses(data || []);
      
      // Auto-select default address
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Error fetching delivery addresses:', error);
    }
  };

  const handlePartSelect = (partId: string) => {
    setSelectedParts(prev =>
      prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
    );
  };

  const handleAddressChange = (addressId: string) => {
    setSelectedAddress(addressId);
  };

  const handleCreateDelivery = async () => {
    if (selectedParts.length === 0 || !selectedAddress) {
      toast({
        title: "Missing information",
        description: "Please select at least one part and a delivery address.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      const userId = collectedParts.find(part => part.id === selectedParts[0])?.order.user_id;

      if (!userId) {
        throw new Error("Unable to determine user ID for the selected parts.");
      }

      // Update shipping status to 'out_for_delivery' for selected parts
      const { error: updateError } = await supabase
        .from('parts')
        .update({ shipping_status: 'out_for_delivery' })
        .in('id', selectedParts);

      if (updateError) throw updateError;

      toast({
        title: "Delivery created",
        description: "Parts have been marked as out for delivery."
      });

      // Refresh parts and clear selections
      fetchCollectedParts();
      setSelectedParts([]);
      setDeliveryAddresses([]);
      setSelectedAddress('');
    } catch (error: any) {
      console.error('Error creating delivery:', error);
      toast({
        title: "Error creating delivery",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Management</h1>
        <p className="text-gray-600">Manage parts ready for delivery</p>
      </div>

      {loading ? (
        <div>Loading parts...</div>
      ) : collectedParts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No parts currently collected and ready for delivery.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Collected Parts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collectedParts.map(part => (
                <div key={part.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{part.part_name}</h3>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded text-blue-500 focus:ring-blue-500"
                      checked={selectedParts.includes(part.id)}
                      onChange={() => handlePartSelect(part.id)}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Part Number: {part.part_number}</p>
                  <p className="text-sm text-gray-500">Quantity: {part.quantity}</p>
                  <p className="text-sm text-gray-500">
                    Vehicle: {part.vehicle?.make} {part.vehicle?.model} ({part.vehicle?.year})
                  </p>
                  <p className="text-sm text-gray-500">
                    Vendor: {part.pickup_notes?.vendor?.business_name || 'N/A'} ({part.pickup_notes?.vendor?.full_name || 'N/A'})
                  </p>
                  <p className="text-sm text-gray-500">
                    Collected At: {new Date(part.collected_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Pickup Notes: {part.pickup_notes?.notes || 'N/A'}
                  </p>
                  <Badge variant="secondary">Collected</Badge>
                </div>
              ))}
            </div>

            {selectedParts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Delivery Details</h2>

                {/* Delivery Address Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Delivery Address</h3>
                  {collectedParts.length > 0 && (
                    <Select onValueChange={(value) => {
                      handleAddressChange(value);
                    }}>
                      <SelectTrigger className="w-[100%]">
                        <SelectValue placeholder="Select a delivery address" />
                      </SelectTrigger>
                      <SelectContent>
                        {collectedParts.map(part => (
                          <SelectItem key={part.id} value={part.order.user_id} onSelect={() => fetchDeliveryAddresses(part.order.user_id)}>
                            {part.order.user_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {deliveryAddresses.length > 0 && (
                    <div className="mt-4">
                      {deliveryAddresses.map(address => (
                        <div key={address.id} className="border rounded-lg p-4 mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-md font-medium">{address.name}</h4>
                            <input
                              type="radio"
                              className="h-5 w-5 rounded text-blue-500 focus:ring-blue-500"
                              value={address.id}
                              checked={selectedAddress === address.id}
                              onChange={() => handleAddressChange(address.id)}
                            />
                          </div>
                          <p className="text-sm text-gray-500">{address.address}</p>
                          <p className="text-sm text-gray-500">Phone: {address.phone}</p>
                          {address.instructions && (
                            <p className="text-sm text-gray-500">Instructions: {address.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create Delivery Button */}
                <Button
                  onClick={handleCreateDelivery}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Creating Delivery...
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-4 w-4" />
                      Create Delivery
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
