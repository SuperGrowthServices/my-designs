import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Package, Car } from 'lucide-react';
import { OrderWithParts } from '@/types/orders';

interface LiveOrdersCardsProps {
  orders: OrderWithParts[];
  selectedOrder?: OrderWithParts;
  onOrderSelect: (order: OrderWithParts) => void;
  loading?: boolean;
}

export const LiveOrdersCards: React.FC<LiveOrdersCardsProps> = ({
  orders,
  selectedOrder,
  onOrderSelect,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return order.parts.some(part => 
      part.part_name.toLowerCase().includes(searchLower) ||
      part.vehicle.make.toLowerCase().includes(searchLower) ||
      part.vehicle.model.toLowerCase().includes(searchLower) ||
      part.part_number?.toLowerCase().includes(searchLower)
    );
  });

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search orders by part name, vehicle, or part number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No orders match your search' : 'No open orders available'}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isSelected = selectedOrder?.id === order.id;
            const hasBids = order.parts.some(part => part.existing_bid);
            const totalParts = order.parts.length;
            const bidParts = order.parts.filter(part => part.existing_bid).length;
            
            return (
              <div
                key={order.id}
                className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-300'
                }`}
                onClick={() => onOrderSelect(order)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-sm">Order #{order.id.slice(0, 8)}</span>
                    {hasBids && (
                      <Badge variant="secondary" className="text-xs">
                        {bidParts}/{totalParts} Bids
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(order.created_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  {order.parts.slice(0, 2).map((part) => (
                    <div key={part.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Car className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{part.part_name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {part.vehicle.year} {part.vehicle.make} {part.vehicle.model} • Qty: {part.quantity}
                          </div>
                        </div>
                      </div>
                      {part.existing_bid && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                          AED {part.existing_bid.price}
                        </Badge>
                      )}
                    </div>
                  ))}
                  
                  {order.parts.length > 2 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      +{order.parts.length - 2} more parts
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
