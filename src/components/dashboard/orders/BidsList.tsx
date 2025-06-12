import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface BidsListProps {
  bids: any[];
  onBidUpdate?: () => void;
}

export const BidsList: React.FC<BidsListProps> = ({ bids, onBidUpdate }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAcceptBid = async (bidId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('accept-bid', {
        body: { bid_id: bidId },
      });

      if (error) {
        throw new Error(`Function invocation failed: ${error.message}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Bid accepted successfully",
        description: "The bid has been accepted and you can now proceed to checkout.",
        variant: "default",
      });

      if (onBidUpdate) {
        onBidUpdate();
      }
    } catch (error: any) {
      console.error('An error occurred during bid acceptance:', error);
      toast({
        title: "Failed to accept bid",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleRejectBid = async (bidId: string) => {
    console.log('=== BID REJECTION START ===');
    console.log('User attempting to reject bid:', { userId: user?.id, bidId });
    
    try {
      const { data: updateData, error: updateError } = await supabase
        .from('bids')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', bidId)
        .select('id, status');

      console.log('Reject operation result:', { updateData, updateError });

      if (updateError) {
        console.error('Error rejecting bid:', updateError);
        throw new Error(`Failed to reject bid: ${updateError.message}`);
      }

      if (!updateData || updateData.length === 0) {
        throw new Error('Failed to update bid status. Permission denied or bid not found.');
      }

      console.log('=== BID REJECTION SUCCESS ===');
      
      toast({
        title: "Bid rejected",
        description: "The bid has been rejected successfully."
      });
      
      if (onBidUpdate) {
        onBidUpdate();
      }

    } catch (error: any) {
      console.error('=== BID REJECTION ERROR ===');
      console.error('Error details:', error);
      
      toast({
        title: "Failed to reject bid",
        description: error.message || "Failed to reject bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-2">
      <h5 className="font-medium text-sm">Bids ({bids.length})</h5>
      {bids.length > 0 ? (
        <div className="space-y-2">
          {bids.map((bid: any) => (
            <div key={bid.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold text-green-600">AED {bid.price}</p>
                    {bid.notes && (
                      <p className="text-sm text-gray-600 mt-1">{bid.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Bid ID: {bid.id.slice(0, 8)}... | Status: {bid.status}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      bid.status === 'accepted' ? 'default' : 
                      bid.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {bid.status}
                  </Badge>
                </div>
                {bid.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptBid(bid.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept Bid
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRejectBid(bid.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No bids yet</p>
      )}
    </div>
  );
};
