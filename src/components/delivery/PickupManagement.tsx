import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, Clock, Truck } from 'lucide-react';

interface ReadyPart {
  id: string;
  part_name: string;
  quantity: number;
  part_number: string;
  shipping_status: string;
  shipped_at: string;
  order: {
    id: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  bid: {
    vendor: {
      full_name: string;
      business_name: string;
    };
  } | null;
}

interface VendorPickupAddress {
  id: string;
  name: string;
  address: string;
  phone: string;
  instructions?: string;
  google_maps_url?: string;
}

export const PickupManagement: React.FC = () => {
  const { isAdmin } = useUserRoles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [readyParts, setReadyParts] = useState<ReadyPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [vendorAddresses, setVendorAddresses] = useState<VendorPickupAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      fetchReadyParts();
    }
  }, [isAdmin]);

  const fetchReadyParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select(`
          id,
          part_name,
          quantity,
          part_number,
          shipping_status,
          shipped_at,
          order:orders (
            id
          ),
          vehicle:vehicles (
            make,
            model,
            year
          ),
          bids (
            price,
            status,
            vendor:user_profiles (
              full_name,
              business_name
            )
          )
        `)
        .eq('shipping_status', 'pending_pickup')
        .eq('bids.status', 'accepted')
        .order('shipped_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to handle potential query errors and null bids
      const transformedData = (data || []).map(part => ({
        ...part,
        bid: part.bids && Array.isArray(part.bids) && part.bids.length > 0 ? part.bids[0] : null
      }));
      
      setReadyParts(transformedData);
    } catch (error) {
      console.error('Error fetching ready parts:', error);
      toast({
        title: "Error loading parts",
        description: "Unable to fetch parts ready for pickup.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_pickup_addresses')
        .select('*');

      if (error) throw error;
      setVendorAddresses(data || []);
    } catch (error) {
      console.error('Error fetching vendor addresses:', error);
    }
  };

  const handlePartSelect = (partId: string) => {
    setSelectedParts(prev => {
      if (prev.includes(partId)) {
        return prev.filter(id => id !== partId);
      } else {
        return [...prev, partId];
      }
    });
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
  };

  const handlePickup = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      if (selectedParts.length === 0) {
        toast({
          title: "No parts selected",
          description: "Please select at least one part for pickup.",
          variant: "destructive"
        });
        return;
      }

      if (!selectedAddress) {
        toast({
          title: "No address selected",
          description: "Please select a vendor address for pickup.",
          variant: "destructive"
        });
        return;
      }

      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to perform this action.",
          variant: "destructive"
        });
        return;
      }

      // Update shipping status directly without pickup notes
      const { error } = await supabase
        .from('parts')
        .update({
          shipping_status: 'collected',
          collected_at: new Date().toISOString(),
          driver_id: user.id
        })
        .in('id', selectedParts);

      if (error) throw error;

      toast({
        title: "Parts marked as collected",
        description: "The selected parts have been marked as collected.",
      });

      // Refresh parts and clear selections
      fetchReadyParts();
      setSelectedParts([]);
      setSelectedAddress('');
    } catch (error: any) {
      console.error('Error marking parts as collected:', error);
      toast({
        title: "Error marking parts as collected",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (readyParts.length > 0) {
      // Fetch vendor addresses when ready parts are loaded
      fetchVendorAddresses();
    }
  }, [readyParts]);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pickup Management</h1>
        <p className="text-gray-600">Manage parts ready for pickup by delivery drivers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parts Ready for Pickup</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading parts...</div>
          ) : readyParts.length === 0 ? (
            <div>No parts are currently ready for pickup.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Part Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Part Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {readyParts.map((part) => (
                    <tr key={part.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {part.part_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {part.part_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {part.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {part.vehicle.make} {part.vehicle.model} {part.vehicle.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {part.bid?.vendor?.business_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">
                          {part.shipping_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            checked={selectedParts.includes(part.id)}
                            onChange={() => handlePartSelect(part.id)}
                          />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pickup Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Vendor Address</h3>
            <Select onValueChange={handleAddressSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a vendor address" />
              </SelectTrigger>
              <SelectContent>
                {vendorAddresses.map((address) => (
                  <SelectItem key={address.id} value={address.id}>
                    {address.name} - {address.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handlePickup} disabled={processing} className="w-full">
            {processing ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                Mark as Collected
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
