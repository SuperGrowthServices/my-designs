import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { OrderWithParts, Bid, Part, Vehicle } from '@/types/orders';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithParts;
  onBidUpdate: () => void;
  mode?: 'bid' | 'accepted';
}

interface BidFormData {
  price: number;
  notes: string;
}

export const OrderBidModal: React.FC<OrderBidModalProps> = ({
  isOpen,
  onClose,
  order: initialOrder,
  onBidUpdate,
  mode = 'bid'
}) => {
  const { user } = useAuth();
  const { hasRole, isAdmin } = useUserRoles();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderWithParts>(initialOrder);
  const [bidForms, setBidForms] = useState<{ [key: string]: BidFormData }>({});
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});
  const [vendorProfileId, setVendorProfileId] = useState<string | null>(null);
  const [expandedParts, setExpandedParts] = useState<{ [key: string]: boolean }>({});
  const [expandedVehicles, setExpandedVehicles] = useState<{ [key: string]: boolean }>({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    if (user) {
      fetchVendorProfile();
    }
  }, [user]);

  const fetchVendorProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setVendorProfileId(profile.id);
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  };

  const handleSubmitBid = async (partId: string) => {
    if (!vendorProfileId || !bidForms[partId]) return;

    setSubmitting(prev => ({ ...prev, [partId]: true }));

    try {
      const now = new Date().toISOString();
      const bidData: Omit<Bid, 'id'> = {
        vendor_id: vendorProfileId,
        part_id: partId,
        price: Number(bidForms[partId].price),
        notes: bidForms[partId].notes || null,
        status: 'pending',
        created_at: now,
        updated_at: now,
        image_url: null,
        shipped_at: null
      };

      const { data: newBid, error } = await supabase
        .from('bids')
        .insert(bidData)
        .select()
        .single();

      if (error) throw error;

      // Update local state with the new bid
      setOrder(prevOrder => {
        const updatedParts = prevOrder.parts.map(part => {
          if (part.id === partId) {
            const bid = newBid as Bid;
            return {
              ...part,
              bids: [...(part.bids || []), bid],
              existing_bid: bid
            };
          }
          return part;
        });

        return {
          ...prevOrder,
          parts: updatedParts
        };
      });

      setBidForms(prev => ({ ...prev, [partId]: { price: 0, notes: '' } }));
      toast({
        title: "Bid submitted successfully",
        description: "Your bid has been sent to the buyer.",
      });
      onBidUpdate();
      onClose();
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: "Error submitting bid",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [partId]: false }));
    }
  };

  const handleUpdateBid = async (partId: string) => {
    if (!vendorProfileId || !bidForms[partId]) return;

    setSubmitting(prev => ({ ...prev, [partId]: true }));

    try {
      const now = new Date().toISOString();
      const part = order.parts.find(p => p.id === partId);
      
      if (!part?.existing_bid) throw new Error('No existing bid found');

      const updateData = {
        price: Number(bidForms[partId].price),
        notes: bidForms[partId].notes || null,
        updated_at: now
      };

      const { data: updatedBid, error } = await supabase
        .from('bids')
        .update(updateData)
        .eq('id', part.existing_bid.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state with the updated bid
      setOrder(prevOrder => {
        const updatedParts = prevOrder.parts.map(p => {
          if (p.id === partId) {
            const bid = updatedBid as Bid;
            return {
              ...p,
              bids: p.bids?.map(b => 
                b.id === part.existing_bid!.id ? bid : b
              ) || [],
              existing_bid: bid
            };
          }
          return p;
        });

        return {
          ...prevOrder,
          parts: updatedParts
        };
      });

      setShowUpdateModal(false);
      toast({
        title: "Bid updated successfully",
        description: "Your bid has been updated.",
      });
      onBidUpdate();
    } catch (error) {
      console.error('Error updating bid:', error);
      toast({
        title: "Error updating bid",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [partId]: false }));
    }
  };

  const handleCancelBid = async (partId: string) => {
    const part = order.parts.find(p => p.id === partId);
    if (!part?.existing_bid) return;

    try {
      const { error } = await supabase
        .from('bids')
        .delete()
        .eq('id', part.existing_bid.id);

      if (error) throw error;

      // Update local state
      setOrder(prevOrder => {
        const updatedParts = prevOrder.parts.map(p => {
          if (p.id === partId) {
            return {
              ...p,
              bids: p.bids?.filter(b => b.id !== part.existing_bid!.id) || [],
              existing_bid: undefined
            };
          }
          return p;
        });

        return {
          ...prevOrder,
          parts: updatedParts
        };
      });

      setShowCancelModal(false);
      toast({
        title: "Bid cancelled successfully",
        description: "Your bid has been removed.",
      });
      onBidUpdate();
    } catch (error) {
      console.error('Error cancelling bid:', error);
      toast({
        title: "Error cancelling bid",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const canBidOnPart = (part: Part) => {
    if (isAdmin) return true;
    
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

  const updateBidForm = (partId: string, field: keyof BidFormData, value: string) => {
    setBidForms(prev => ({
      ...prev,
      [partId]: {
        ...prev[partId],
        [field]: field === 'price' ? Number(value) : value
      }
    }));
  };

  const renderVehicleDetails = (vehicle: Vehicle | undefined) => {
    if (!vehicle) return null;
    
    return (
      <div className="text-sm text-gray-600 mt-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Make:</span> {vehicle.make}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Model:</span> {vehicle.model}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Year:</span> {vehicle.year}
        </div>
      </div>
    );
  };

  const renderPartHeader = (part: Part) => {
    const isAccepted = part.existing_bid?.status === 'accepted';
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium">{part.part_name}</h3>
          <div className="text-sm text-gray-600">
            Quantity: {part.quantity}
            {part.part_number && ` • Part #: ${part.part_number}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAccepted ? (
            <Badge variant="default" className={cn("bg-green-500", "text-white")}>Accepted</Badge>
          ) : part.existing_bid ? (
            <Badge variant="secondary">Bid Placed</Badge>
          ) : (
            <Badge variant="outline">No Bid</Badge>
          )}
        </div>
      </div>
    );
  };

  const renderPartContent = (part: Part) => {
    const isAccepted = part.existing_bid?.status === 'accepted';
    const canBid = canBidOnPart(part);
    const isSubmitting = submitting[part.id];

    return (
      <div className="space-y-4">
        {part.description && (
          <div className="text-sm text-gray-600">
            {part.description}
          </div>
        )}

        {part.vehicle && renderVehicleDetails(part.vehicle)}

        {isAccepted ? (
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-sm font-medium text-green-800">
              Your bid was accepted!
            </div>
            <div className="text-sm text-green-700 mt-1">
              Price: AED {part.existing_bid!.price.toFixed(2)}
            </div>
            {part.existing_bid!.notes && (
              <div className="text-sm text-green-700 mt-1">
                Notes: {part.existing_bid!.notes}
              </div>
            )}
          </div>
        ) : part.existing_bid ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm font-medium text-blue-800">
                Your current bid
              </div>
              <div className="text-sm text-blue-700">
                Price: AED {part.existing_bid.price.toFixed(2)}
              </div>
              {part.existing_bid.notes && (
                <div className="text-sm text-blue-700">
                  Notes: {part.existing_bid.notes}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateBid(part.id)}
                disabled={isSubmitting}
              >
                Update Bid
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelBid(part.id)}
                disabled={isSubmitting}
              >
                Cancel Bid
              </Button>
            </div>
          </div>
        ) : canBid ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`price-${part.id}`}>Your Price (AED)</Label>
                <Input
                  id={`price-${part.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter your bid price"
                  value={bidForms[part.id]?.price.toString() || ''}
                  onChange={(e) => updateBidForm(part.id, 'price', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`notes-${part.id}`}>Notes (Optional)</Label>
                <Textarea
                  id={`notes-${part.id}`}
                  placeholder="Add any notes about your bid..."
                  value={bidForms[part.id]?.notes || ''}
                  onChange={(e) => updateBidForm(part.id, 'notes', e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={() => handleSubmitBid(part.id)}
              disabled={isSubmitting || !bidForms[part.id]?.price}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bid'}
            </Button>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            You cannot bid on this part at this time.
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Place Bid</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {order.parts.map(part => (
            <div key={part.id} className="space-y-4">
              {renderPartHeader(part)}
              {renderPartContent(part)}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
