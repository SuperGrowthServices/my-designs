
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderWithParts {
  id: string;
  created_at: string;
  parts: {
    id: string;
    part_name: string;
    description: string;
    part_number: string;
    quantity: number;
    vehicle: {
      make: string;
      model: string;
      year: number;
    };
    existing_bid?: {
      id: string;
      price: number;
      notes: string;
      status: string;
    };
  }[];
}

interface LiveOrdersTableProps {
  orders: OrderWithParts[];
  selectedOrder: OrderWithParts | null;
  onOrderSelect: (order: OrderWithParts) => void;
  loading: boolean;
}

export const LiveOrdersTable: React.FC<LiveOrdersTableProps> = ({
  orders,
  selectedOrder,
  onOrderSelect,
  loading
}) => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getOrderTitle = (order: OrderWithParts) => {
    if (order.parts.length === 0) return 'No Parts';
    
    const firstPart = order.parts[0];
    const { make, model, year } = firstPart.vehicle;
    return `${make} ${model} ${year} (${order.parts.length} Part${order.parts.length > 1 ? 's' : ''})`;
  };

  if (loading) {
    return <div className="p-4 text-center">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="p-4 text-center text-gray-500">No open orders available</div>;
  }

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const isSelected = selectedOrder?.id === order.id;
            const hasBids = order.parts.some(part => part.existing_bid);
            
            return (
              <React.Fragment key={order.id}>
                <TableRow
                  className={`cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => onOrderSelect(order)}
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(order.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{getOrderTitle(order)}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {hasBids && (
                      <Badge variant="secondary" className="text-xs">
                        Bid Placed
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={3} className="bg-gray-50 p-4">
                      <div className="space-y-3">
                        <div className="text-sm text-gray-500">
                          Order #{order.id.slice(0, 8)}
                        </div>
                        
                        <div className="space-y-2">
                          {order.parts.map((part) => (
                            <div key={part.id} className="border-l-2 border-gray-200 pl-3">
                              <div className="font-medium text-sm">{part.part_name}</div>
                              {part.description && (
                                <div className="text-sm text-gray-600">{part.description}</div>
                              )}
                              <div className="text-xs text-gray-500">
                                Part #: {part.part_number || 'Not specified'} | Qty: {part.quantity}
                              </div>
                              {part.existing_bid && (
                                <div className="text-xs text-green-600 font-medium">
                                  Your bid: AED {part.existing_bid.price} ({part.existing_bid.status})
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
