import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { CompactStatsBar } from './CompactStatsBar';
import { OrderCard } from './OrderCard';
import { OrderBidModal } from './OrderBidModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, CheckCircle2, Clock, RefreshCw, ShoppingCart } from 'lucide-react';
import { OrderWithParts, Bid } from '@/types/orders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = 'newest' | 'oldest' | 'vehicle';

export const VendorHome: React.FC = () => {
  const { user } = useAuth();
  const { hasRole, isAdmin } = useUserRoles();
  const [orders, setOrders] = useState<OrderWithParts[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithParts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentTab, setCurrentTab] = useState('new');

  const vendorProfileId = user?.id;

  useEffect(() => {
    if (vendorProfileId) {
      handleLoadData();
    }
  }, [vendorProfileId]);

  const handleLoadData = async () => {
    setLoading(true);
    await fetchLiveOrders();
    setLoading(false);
  };

  const fetchLiveOrders = async () => {
    if (!vendorProfileId) return;
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          parts:parts(
            *,
            vehicle:vehicles(*),
            bids:bids(*)
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      // If not an admin, only show orders where:
      // 1. No parts have accepted bids OR
      // 2. The vendor has an accepted bid on any part
      if (!isAdmin) {
        query = query.or(`
          parts.bids.status.not.eq.accepted,
          and(
            parts.bids.status.eq.accepted,
            parts.bids.vendor_id.eq.${vendorProfileId}
          )
        `);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const processedOrders = (data || []).map(order => ({
        ...order,
        parts: order.parts.map(part => ({
          ...part,
          existing_bid: part.bids?.find(bid => bid.vendor_id === vendorProfileId),
          other_bids_count: part.bids?.filter(b => 
            b.vendor_id !== vendorProfileId && 
            b.status === 'pending'
          ).length || 0,
          // Add a flag to indicate if this part has any accepted bids
          has_accepted_bid: part.bids?.some(b => b.status === 'accepted') || false
        }))
      }));

      // Filter out orders where all parts have accepted bids (unless vendor has one of them)
      const filteredOrders = processedOrders.filter(order => {
        if (isAdmin) return true;
        return order.parts.some(part => 
          !part.has_accepted_bid || 
          part.existing_bid?.status === 'accepted'
        );
      });

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching live orders:', error);
    }
  };

  const handleRefresh = () => {
    if (!refreshing) {
      setRefreshing(true);
      handleLoadData().finally(() => setRefreshing(false));
    }
  };

  const handleBidUpdate = () => {
    handleLoadData();
  };
  
  const handleOrderSelect = (order: OrderWithParts) => {
    setSelectedOrder(order);
    setShowBidModal(true);
  };

  const stats = useMemo(() => {
    if (!vendorProfileId) return { openOrders: 0, quotesSubmitted: 0, quotesAccepted: 0, totalEarnings: 0 };
    
    const allBids = orders.flatMap(o => o.parts.flatMap(p => p.bids || []));
    const vendorBids = allBids.filter(b => b.vendor_id === vendorProfileId);
    const acceptedBids = vendorBids.filter(b => b.status === 'accepted');

    return {
        openOrders: orders.length,
        quotesSubmitted: vendorBids.length,
        quotesAccepted: acceptedBids.length,
        totalEarnings: acceptedBids.reduce((sum, bid) => sum + (bid.price || 0), 0),
    };
  }, [orders, vendorProfileId]);

  const displayedOrders = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    const filtered = orders.filter(order => {
      // Only show orders that the vendor can bid on
      const canBidOnOrder = order.parts.some(part => 
        !part.existing_bid && // No existing bid from this vendor
        !part.bids?.some(b => b.status === 'accepted') // No accepted bids
      );
      
      if (!canBidOnOrder && !isAdmin) return false;
      
      const hasPendingBid = order.parts.some(p => p.existing_bid?.status === 'pending');
      const hasAcceptedBid = order.parts.some(p => p.existing_bid?.status === 'accepted');
      
      const matchesTab = 
        (currentTab === 'new' && !hasPendingBid && !hasAcceptedBid) ||
        (currentTab === 'mybids' && hasPendingBid && !hasAcceptedBid) ||
        (currentTab === 'accepted' && hasAcceptedBid);

      if (!matchesTab) return false;

      if (searchTerm) {
        return order.parts.some(part => 
          part.part_name.toLowerCase().includes(searchLower) ||
          (part.vehicle?.make || '').toLowerCase().includes(searchLower) ||
          (part.vehicle?.model || '').toLowerCase().includes(searchLower) ||
          part.part_number?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'vehicle':
          const aVehicle = `${a.parts[0]?.vehicle?.make || ''} ${a.parts[0]?.vehicle?.model || ''}`;
          const bVehicle = `${b.parts[0]?.vehicle?.make || ''} ${b.parts[0]?.vehicle?.model || ''}`;
          return aVehicle.localeCompare(bVehicle);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [orders, currentTab, searchTerm, sortOption, isAdmin]);

  const getEmptyState = () => {
    if (loading) return null;
    const titles = {
      new: { title: 'No new orders available', desc: 'Check back later for new orders from buyers.' },
      mybids: { title: "You haven't placed any bids yet", desc: 'Browse new orders and place your first bid.' },
      accepted: { title: 'No accepted bids yet', desc: 'Once a buyer accepts your bid, it will appear here.' },
    };
    const content = titles[currentTab as keyof typeof titles];

    if (searchTerm) {
        content.title = 'No orders match your search';
        content.desc = 'Try adjusting your search terms.';
    }

    return (
      <div className="text-center py-16 col-span-full">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">{content.title}</h3>
        <p className="text-muted-foreground">{content.desc}</p>
      </div>
    );
  };
  
  const counts = useMemo(() => ({
    new: orders.filter(o => !o.parts.some(p => p.existing_bid)).length,
    mybids: orders.filter(o => o.parts.some(p => p.existing_bid?.status === 'pending')).length,
    accepted: orders.filter(o => o.parts.some(p => p.existing_bid?.status === 'accepted')).length,
  }), [orders]);

  return (
    <div className="space-y-6">
      <CompactStatsBar stats={stats} />
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by part, vehicle, or part number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="vehicle">By Vehicle</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="new"><Package className="w-4 h-4 mr-2" />New Orders ({counts.new})</TabsTrigger>
            <TabsTrigger value="mybids"><Clock className="w-4 h-4 mr-2" />My Bids ({counts.mybids})</TabsTrigger>
            <TabsTrigger value="accepted"><CheckCircle2 className="w-4 h-4 mr-2" />Accepted Bids ({counts.accepted})</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]">
            {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="bg-gray-100 rounded-lg h-40 animate-pulse" />)
            ) : displayedOrders.length > 0 ? (
              displayedOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isSelected={selectedOrder?.id === order.id}
                  onClick={() => handleOrderSelect(order)}
                />
              ))
            ) : (
              getEmptyState()
            )}
          </div>
        </Tabs>
      </div>

      {showBidModal && selectedOrder && (
        <OrderBidModal
          order={selectedOrder}
          isOpen={showBidModal}
          onClose={() => {
            setShowBidModal(false);
            setSelectedOrder(null);
          }}
          onBidUpdate={handleBidUpdate}
          mode={currentTab === 'accepted' ? 'accepted' : 'bid'}
        />
      )}
    </div>
  );
};
