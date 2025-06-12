import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Users, Lock } from 'lucide-react';
import { OrderWithParts } from '@/types/orders';

interface OtherBid {
  id: string;
  price: number;
  notes: string;
  created_at: string;
}

interface BiddingInterfaceProps {
  order: OrderWithParts;
  vendorProfileId: string;
  onBidSubmitted: () => void;
}

export const BiddingInterface: React.FC<BiddingInterfaceProps> = ({
  order,
  vendorProfileId,
  onBidSubmitted
}) => {
  const { toast } = useToast();
  const [partBids, setPartBids] = useState<Record<string, string>>({});
  const [orderNotes, setOrderNotes] = useState('');
  const [otherBids, setOtherBids] = useState<OtherBid[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      // Reset form
      const initialBids: Record<string, string> = {};
      let hasExistingNotes = '';
      
      order.parts.forEach(part => {
        if (part.existing_bid) {
          initialBids[part.id] = part.existing_bid.price.toString();
          if (part.existing_bid.notes && !hasExistingNotes) {
            hasExistingNotes = part.existing_bid.notes;
          }
        } else {
          initialBids[part.id] = '';
        }
      });
      
      setPartBids(initialBids);
      setOrderNotes(hasExistingNotes);
      
      // Fetch other bids for this order
      fetchOtherBids();
    }
  }, [order, vendorProfileId]);

  const fetchOtherBids = async () => {
    if (!order || !vendorProfileId) return;

    try {
      const partIds = order.parts.map(part => part.id);
      
      const { data: bids, error } = await supabase
        .from('bids')
        .select('id, price, notes, created_at')
        .in('part_id', partIds)
        .neq('vendor_id', vendorProfileId)
        .order('price', { ascending: true });

      if (error) throw error;
      
      setOtherBids(bids || []);
    } catch (error) {
      console.error('Error fetching other bids:', error);
    }
  };

  const updatePartBid = (partId: string, value: string) => {
    setPartBids(prev => ({
      ...prev,
      [partId]: value
    }));
  };

  const handleSubmitBids = async () => {
    if (!order || !vendorProfileId) return;

    const validBids = Object.entries(partBids).filter(([_, price]) => price && parseFloat(price) > 0);
    
    if (validBids.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one bid price.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      for (const [partId, priceStr] of validBids) {
        const part = order.parts.find(p => p.id === partId);
        if (!part) continue;

        // Skip parts that already have accepted bids (unless it's our bid)
        if (part.bids?.some(b => b.status === 'accepted' && b.vendor_id !== vendorProfileId)) {
          continue;
        }

        const price = parseFloat(priceStr);
        
        if (part.existing_bid) {
          // Update existing bid
          const { error } = await supabase
            .from('bids')
            .update({
              price: price,
              notes: orderNotes || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', part.existing_bid.id)
            .eq('vendor_id', vendorProfileId); // Extra safety check

          if (error) throw error;
        } else {
          // Create new bid
          const { error } = await supabase
            .from('bids')
            .insert({
              part_id: partId,
              vendor_id: vendorProfileId,
              price: price,
              notes: orderNotes || null,
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
        }
      }
      
      toast({
        title: "Bids submitted",
        description: `Successfully submitted ${validBids.length} bid(s).`
      });

      onBidSubmitted();
      fetchOtherBids();
    } catch (error) {
      console.error('Error submitting bids:', error);
      toast({
        title: "Error submitting bids",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawBid = async (partId: string) => {
    if (!order || !vendorProfileId) return;

    const part = order.parts.find(p => p.id === partId);
    if (!part?.existing_bid) return;

    // Prevent withdrawal of accepted bids
    if (part.existing_bid.status === 'accepted') {
      toast({
        title: "Cannot withdraw accepted bid",
        description: "This bid has been accepted and cannot be withdrawn.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('bids')
        .delete()
        .eq('id', part.existing_bid.id)
        .eq('vendor_id', vendorProfileId); // Extra safety check

      if (error) throw error;
      
      toast({
        title: "Bid withdrawn",
        description: "Your bid has been withdrawn successfully."
      });
      
      setPartBids(prev => ({ ...prev, [partId]: '' }));
      onBidSubmitted();
      fetchOtherBids();
    } catch (error: any) {
      console.error('Error withdrawing bid:', error);
      toast({
        title: "Error withdrawing bid",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getBidStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default'; // Will be styled green
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getBidStatusBadgeClass = (status: string) => {
    if (status === 'accepted') {
      return 'bg-green-500 text-white hover:bg-green-600';
    }
    return '';
  };

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Select an order to place a bid</p>
        </CardContent>
      </Card>
    );
  }

  const hasAnyBids = order.parts.some(part => part.existing_bid);
  const hasValidBids = Object.values(partBids).some(price => price && parseFloat(price) > 0);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Place Your Bids</CardTitle>
            <div className="text-sm text-gray-600">
              Order #{order.id.slice(0, 8)} • {order.parts.length} Parts
            </div>
          </CardHeader>
          
          {/* Parts Bidding Table */}
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Details</TableHead>
                    <TableHead className="text-right">Your Bid (AED)</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.parts.map((part) => {
                    const isAccepted = part.existing_bid?.status === 'accepted';
                    const isRejected = part.existing_bid?.status === 'rejected';
                    
                    return (
                      <TableRow key={part.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{part.part_name}</div>
                            <div className="text-xs text-gray-600">
                              {part.vehicle.make} {part.vehicle.model} {part.vehicle.year}
                            </div>
                            <div className="text-xs text-gray-500">
                              Qty: {part.quantity} • Part #: {part.part_number || 'Not specified'}
                            </div>
                            {part.existing_bid && (
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={getBidStatusBadgeVariant(part.existing_bid.status)}
                                  className={`text-xs ${getBidStatusBadgeClass(part.existing_bid.status)}`}
                                >
                                  {isAccepted && <Lock className="w-3 h-3 mr-1" />}
                                  Current: AED {part.existing_bid.price} ({part.existing_bid.status})
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={partBids[part.id] || ''}
                            onChange={(e) => updatePartBid(part.id, e.target.value)}
                            disabled={isAccepted}
                            className={`w-24 text-right ${isAccepted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          />
                        </TableCell>
                        <TableCell>
                          {part.existing_bid && (
                            <>
                              {isAccepted ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={true}
                                      className="text-xs bg-gray-100 text-gray-400 cursor-not-allowed"
                                    >
                                      <Lock className="w-3 h-3 mr-1" />
                                      Locked
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Accepted bids cannot be withdrawn</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleWithdrawBid(part.id)}
                                  disabled={submitting}
                                  className="text-xs"
                                >
                                  Withdraw
                                </Button>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Order Notes */}
              <div>
                <Label htmlFor="order-notes">Order Notes (Optional)</Label>
                <Textarea
                  id="order-notes"
                  placeholder="Any additional information for this entire order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitBids}
                disabled={submitting || !hasValidBids}
                className="w-full bg-yellow-500 hover:bg-yellow-600"
              >
                {submitting ? 'Submitting...' : hasAnyBids ? 'Update Bids' : 'Submit Bids'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Other Bids */}
        {otherBids.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Competing Bids ({otherBids.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {otherBids.map((bid, index) => (
                  <div key={bid.id} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-green-600">AED {bid.price}</div>
                      {bid.notes && (
                        <div className="text-sm text-gray-600">{bid.notes}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Vendor {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};
