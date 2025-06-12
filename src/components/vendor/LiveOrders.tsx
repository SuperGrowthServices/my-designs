
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Bid {
  id: string;
  price: number;
  notes: string;
  status: string;
}

interface Vehicle {
  make: string;
  model: string;
  year: number;
}

interface Part {
  id: string;
  part_name: string;
  description: string;
  part_number: string;
  quantity: number;
  vehicle: Vehicle;
  existing_bid?: Bid;
}

interface Order {
  id: string;
  created_at: string;
  parts: Part[];
}

interface BidFormData {
  price: string;
  notes: string;
}

// Raw Supabase response types to avoid deep type inference
interface RawOrderData {
  id: string;
  created_at: string;
  parts: RawPartData[];
}

interface RawPartData {
  id: string;
  part_name: string;
  description: string;
  part_number: string;
  quantity: number;
  vehicle: RawVehicleData;
}

interface RawVehicleData {
  make: string;
  model: string;
  year: number;
}

export const LiveOrders: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidForms, setBidForms] = useState<Record<string, BidFormData>>({});
  const [vendorProfileId, setVendorProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVendorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (vendorProfileId) {
      fetchLiveOrders();
    }
  }, [vendorProfileId]);

  const fetchVendorProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .eq('is_vendor', true)
        .single();

      if (error) {
        console.error('Error fetching vendor profile:', error);
        return;
      }

      setVendorProfileId(profile.id);
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  };

  const fetchLiveOrders = async () => {
    if (!vendorProfileId) return;

    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          parts (
            id,
            part_name,
            description,
            part_number,
            quantity,
            vehicle:vehicles (
              make,
              model,
              year
            )
          )
        `)
        .eq('status', 'open');

      if (error) throw error;

      if (!ordersData) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Process orders with explicit typing
      const processedOrders = await processOrdersWithBids(ordersData as RawOrderData[]);
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching live orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const processOrdersWithBids = async (rawOrders: RawOrderData[]): Promise<Order[]> => {
    const processedOrders: Order[] = [];

    for (const order of rawOrders) {
      const processedParts: Part[] = [];

      for (const part of order.parts) {
        const processedPart = await processPartWithBid(part);
        processedParts.push(processedPart);
      }

      processedOrders.push({
        id: order.id,
        created_at: order.created_at,
        parts: processedParts
      });
    }

    return processedOrders;
  };

  const processPartWithBid = async (rawPart: RawPartData): Promise<Part> => {
    const { data: bid } = await supabase
      .from('bids')
      .select('*')
      .eq('part_id', rawPart.id)
      .eq('vendor_id', vendorProfileId)
      .maybeSingle();

    return {
      id: rawPart.id,
      part_name: rawPart.part_name,
      description: rawPart.description,
      part_number: rawPart.part_number,
      quantity: rawPart.quantity,
      vehicle: {
        make: rawPart.vehicle.make,
        model: rawPart.vehicle.model,
        year: rawPart.vehicle.year
      },
      existing_bid: bid || undefined
    };
  };

  const handleBidSubmit = async (partId: string) => {
    if (!vendorProfileId) return;

    const bidData = bidForms[partId];
    if (!bidData || !bidData.price) {
      toast({
        title: "Error",
        description: "Please enter a bid price.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bids')
        .insert({
          part_id: partId,
          vendor_id: vendorProfileId,
          price: parseFloat(bidData.price),
          notes: bidData.notes || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Bid submitted",
        description: "Your bid has been submitted successfully."
      });

      setBidForms(prev => ({ ...prev, [partId]: { price: '', notes: '' } }));
      fetchLiveOrders();
    } catch (error: any) {
      console.error('Error submitting bid:', error);
      toast({
        title: "Error submitting bid",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateBidForm = (partId: string, field: keyof BidFormData, value: string) => {
    setBidForms(prev => ({
      ...prev,
      [partId]: {
        ...prev[partId],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Live Orders</h1>
        <p className="text-gray-600">Browse and bid on open orders.</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No open orders available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {orders.map((order) => (
            <AccordionItem key={order.id} value={order.id}>
              <AccordionTrigger className="text-left">
                <div>
                  <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-500">{order.parts.length} parts</p>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {order.parts.map((part) => (
                    <Card key={part.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{part.part_name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {part.vehicle.year} {part.vehicle.make} {part.vehicle.model}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p><strong>Description:</strong> {part.description || 'No description'}</p>
                            <p><strong>Part Number:</strong> {part.part_number || 'Not specified'}</p>
                            <p><strong>Quantity:</strong> {part.quantity}</p>
                          </div>

                          {part.existing_bid ? (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-800">Your Bid</h4>
                              <p><strong>Price:</strong> AED {part.existing_bid.price}</p>
                              <p><strong>Status:</strong> {part.existing_bid.status}</p>
                              {part.existing_bid.notes && (
                                <p><strong>Notes:</strong> {part.existing_bid.notes}</p>
                              )}
                            </div>
                          ) : (
                            <div className="border rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Submit Your Bid</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`price-${part.id}`}>Bid Price (AED) *</Label>
                                  <Input
                                    id={`price-${part.id}`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={bidForms[part.id]?.price || ''}
                                    onChange={(e) => updateBidForm(part.id, 'price', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`notes-${part.id}`}>Notes (Optional)</Label>
                                  <Textarea
                                    id={`notes-${part.id}`}
                                    placeholder="Any additional information..."
                                    value={bidForms[part.id]?.notes || ''}
                                    onChange={(e) => updateBidForm(part.id, 'notes', e.target.value)}
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={() => handleBidSubmit(part.id)}
                                className="mt-4 bg-yellow-500 hover:bg-yellow-600"
                              >
                                Submit Bid
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
