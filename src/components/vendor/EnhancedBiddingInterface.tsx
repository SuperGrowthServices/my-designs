import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Calculator, AlertCircle, Check, Package, Trash2, Lock } from 'lucide-react';
import { OrderWithParts, Part } from '@/types/orders';

interface EnhancedBiddingInterfaceProps {
  order: OrderWithParts;
  vendorProfileId: string;
  onBidSubmitted: () => void;
}

export const EnhancedBiddingInterface: React.FC<EnhancedBiddingInterfaceProps> = ({
  order,
  vendorProfileId,
  onBidSubmitted
}) => {
  const { toast } = useToast();
  const [partBids, setPartBids] = useState<Record<string, string>>({});
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
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
    }
  }, [order]);

  const updatePartBid = (partId: string, value: string) => {
    setPartBids(prev => ({
      ...prev,
      [partId]: value
    }));
  };

  const handleWithdrawBid = async (partId: string) => {
    if (!order) return;

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
        .eq('id', part.existing_bid.id);

      if (error) throw error;
      
      toast({
        title: "Bid withdrawn",
        description: "Your bid has been withdrawn successfully."
      });
      
      setPartBids(prev => ({ ...prev, [partId]: '' }));
      onBidSubmitted();
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

  const handleSubmitBids = async () => {
    if (!order) return;

    const validBids = Object.entries(partBids).filter(([_, price]) => price && parseFloat(price) > 0);
    if (validBids.length === 0) {
      toast({
        title: "No valid bids",
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
        title: "Bids submitted successfully",
        description: `Successfully placed ${validBids.length} bid${validBids.length > 1 ? 's' : ''}.`
      });

      // Reset form
      setPartBids({});
      setOrderNotes('');
      onBidSubmitted();
    } catch (error: any) {
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

  const canBidOnPart = (part: Part) => {
    // Check if any other vendor has an accepted bid
    const hasOtherAcceptedBid = part.bids?.some(b => 
      b.status === 'accepted' && 
      b.vendor_id !== vendorProfileId
    );
    
    if (hasOtherAcceptedBid) return false;
    
    // Can always update our own bid
    if (part.existing_bid) return true;
    
    return true;
  };

  const calculateTotal = () => {
    return Object.values(partBids)
      .filter(price => price && parseFloat(price) > 0)
      .reduce((sum, price) => sum + parseFloat(price), 0);
  };

  if (!order) {
    return (
      <Card className="h-fit">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Ready to Bid</h3>
          <p className="text-sm text-gray-500">Select an order from the left to start placing your bids</p>
        </CardContent>
      </Card>
    );
  }

  const hasValidBids = Object.values(partBids).some(price => price && parseFloat(price) > 0);
  const acceptedParts = order.parts.filter(part => part.existing_bid?.status === 'accepted');

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bidding on Order #{order.id.slice(0, 8)}
            </CardTitle>
            <div className="text-sm text-gray-600">
              {order.parts.length} parts • Created {new Date(order.created_at).toLocaleDateString()}
            </div>
          </CardHeader>
        </Card>

        {/* Parts Bidding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Part Details & Bidding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.parts.map((part, index) => {
              const isAccepted = part.existing_bid?.status === 'accepted';
              const currentBid = partBids[part.id] || '';
              
              return (
                <div key={part.id}>
                  {index > 0 && <Separator className="my-4" />}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{part.part_name}</div>
                        <div className="text-xs text-gray-600">
                          {part.vehicle.year} {part.vehicle.make} {part.vehicle.model}
                        </div>
                        <div className="text-xs text-gray-500">
                          Qty: {part.quantity} • Part #: {part.part_number || 'Not specified'}
                        </div>
                      </div>
                      
                      {part.existing_bid && (
                        <Badge 
                          variant={isAccepted ? 'default' : 'secondary'}
                          className={isAccepted ? 'bg-green-500 text-white' : ''}
                        >
                          {isAccepted && <Check className="w-3 h-3 mr-1" />}
                          {part.existing_bid.status}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`bid-${part.id}`} className="text-xs">Your Bid (AED)</Label>
                        <Input
                          id={`bid-${part.id}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={currentBid}
                          onChange={(e) => updatePartBid(part.id, e.target.value)}
                          disabled={isAccepted}
                          className={isAccepted ? 'bg-gray-100' : ''}
                        />
                      </div>
                      
                      {part.existing_bid && (
                        <div className="w-24">
                          <Label className="text-xs">Current</Label>
                          <div className="h-9 flex items-center text-sm font-medium text-green-600">
                            AED {part.existing_bid.price}
                          </div>
                        </div>
                      )}

                      {part.existing_bid && (
                        <div className="w-20">
                          <Label className="text-xs opacity-0">Action</Label>
                          <div className="h-9 flex items-center">
                            {isAccepted ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={true}
                                    className="bg-gray-100 text-gray-400 cursor-not-allowed"
                                  >
                                    <Lock className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Accepted bids cannot be withdrawn</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleWithdrawBid(part.id)}
                                    disabled={submitting}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Withdraw this bid</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {isAccepted && (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                        <AlertCircle className="w-3 h-3" />
                        This bid has been accepted and cannot be modified
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Order Notes */}
            <div className="pt-4">
              <Label htmlFor="order-notes" className="text-sm">Order Notes (Optional)</Label>
              <Textarea
                id="order-notes"
                placeholder="Any additional information for this order..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary & Submit */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Total Bid Amount</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                AED {calculateTotal().toFixed(2)}
              </div>
            </div>
            
            <Button
              onClick={handleSubmitBids}
              disabled={submitting || !hasValidBids}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              size="lg"
            >
              {submitting ? 'Submitting Bids...' : 'Submit All Bids'}
            </Button>
            
            {acceptedParts.length > 0 && (
              <div className="text-xs text-center text-gray-500 mt-2">
                {acceptedParts.length} part(s) already accepted and locked
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
