import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eye, Edit, Trash2 } from 'lucide-react';

interface BidWithDetails {
  id: string;
  price: number;
  status: string;
  notes: string;
  created_at: string;
  part: {
    id: string;
    part_name: string;
    quantity: number;
    order_id: string;
  };
  order: {
    status: string;
    created_at: string;
  };
  bid_range?: {
    min: number;
    max: number;
    total_bids: number;
  };
}

interface BidRangeInfoProps {
  bid: BidWithDetails;
}

const BidRangeInfo: React.FC<BidRangeInfoProps> = ({ bid }) => {
  const [range, setRange] = useState<{ min: number; max: number; total_bids: number } | null>(null);

  useEffect(() => {
    const fetchBidRange = async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('price')
        .eq('part_id', bid.part.id)
        .eq('status', 'pending');

      if (!error && data && data.length > 0) {
        const prices = data.map(bid => bid.price);
        setRange({
          min: Math.min(...prices),
          max: Math.max(...prices),
          total_bids: data.length
        });
      }
    };

    fetchBidRange();
  }, [bid.part.id]);

  if (!range) return null;

  if (range.total_bids === 1) {
    return (
      <p className="text-sm text-gray-600 mt-1">
        You are the only bidder
      </p>
    );
  }

  const isLowest = bid.price === range.min;
  return (
    <p className="text-sm text-gray-600 mt-1">
      Bidding Range: AED {range.min.toFixed(2)} - {range.max.toFixed(2)}
      {isLowest && <span className="text-green-600 ml-2">(You have the lowest bid)</span>}
    </p>
  );
};

export const MyBids: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bids, setBids] = useState<BidWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    if (user) {
      fetchMyBids();
    }
  }, [user]);

  const fetchMyBids = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          part:part_id (
            id,
            part_name,
            quantity,
            order_id,
            order:order_id (
              status,
              created_at
            )
          )
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBids = data?.map((bid: any) => ({
        id: bid.id,
        price: Number(bid.price),
        status: bid.status,
        notes: bid.notes,
        created_at: bid.created_at,
        part: {
          id: bid.part.id,
          part_name: bid.part.part_name,
          quantity: bid.part.quantity,
          order_id: bid.part.order_id
        },
        order: {
          status: bid.part.order.status,
          created_at: bid.part.order.created_at
        }
      })) || [];

      setBids(formattedBids);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast({
        title: "Error loading bids",
        description: "Unable to fetch your bids. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawBid = async (bidId: string) => {
    try {
      const { error } = await supabase
        .from('bids')
        .delete()
        .eq('id', bidId)
        .eq('vendor_id', user!.id);

      if (error) throw error;

      toast({
        title: "Bid withdrawn",
        description: "Your bid has been withdrawn successfully."
      });
      
      fetchMyBids(); // Refresh the list
    } catch (error) {
      console.error('Error withdrawing bid:', error);
      toast({
        title: "Error withdrawing bid",
        description: "Unable to withdraw bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredBids = bids.filter(bid => {
    if (filterStatus === 'all') return true;
    return bid.status === filterStatus;
  });

  if (loading) {
    return <div>Loading your bids...</div>;
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bids submitted</h3>
        <p className="text-gray-600">Your submitted bids will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bids</h1>
        <p className="text-gray-600">Track the status of your submitted bids.</p>
      </div>

      <div className="flex space-x-2 pb-4 border-b">
        <Button
          variant={filterStatus === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filterStatus === 'accepted' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('accepted')}
        >
          Accepted
        </Button>
        <Button
          variant={filterStatus === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('rejected')}
        >
          Rejected
        </Button>
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
        >
          All Bids
        </Button>
      </div>

      <div className="space-y-4">
        {filteredBids.length > 0 ? (
          filteredBids.map((bid) => (
            <Card key={bid.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{bid.part.part_name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Order #{bid.part.order_id.slice(0, 8)} • Qty: {bid.part.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(bid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getBidStatusColor(bid.status)}>
                      {bid.status}
                    </Badge>
                    <Badge variant={getOrderStatusColor(bid.order.status)}>
                      Order: {bid.order.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">AED {bid.price.toFixed(2)}</p>
                      {bid.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Notes:</span> {bid.notes}
                        </p>
                      )}
                      <BidRangeInfo bid={bid} />
                    </div>
                  </div>

                  {bid.status === 'pending' && bid.order.status === 'open' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Bid
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleWithdrawBid(bid.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    </div>
                  )}

                  {bid.status === 'accepted' && (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-green-800 font-medium">
                        🎉 Congratulations! Your bid was accepted.
                      </p>
                      <p className="text-green-700 text-sm">
                        You will receive payment once the customer completes their order.
                      </p>
                    </div>
                  )}

                  {bid.status === 'rejected' && (
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-red-800 font-medium">
                        This bid was not accepted by the buyer.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filterStatus} bids
            </h3>
            <p className="text-gray-600">
              You do not have any bids with this status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
