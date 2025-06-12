import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OrderDetailsModal } from './OrderDetailsModal'; // This will be created next
import { Badge } from '@/components/ui/badge';

// Type definitions based on the get_live_orders function
export interface Bid {
  price: number;
  vendor_name: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  vendor_pickup_address: string | null;
  vendor_whatsapp: string | null;
  vendor_maps_url: string | null;
}

export interface Part {
  part_name: string;
  quantity: number;
  shipping_status: string | null;
  description: string | null;
  bids: Bid[] | null;
  vehicle: Vehicle | null;
  is_paid: boolean;
  customer_name: string;
  customer_id: string;
  customer_whatsapp: string | null;
  invoice: Invoice | null;
  vehicles: Vehicle[];
  part_count: number;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
}

export interface Invoice {
  total_amount: number;
  paid_at: string | null;
  delivery_address: string;
  stripe_payment_intent_id: string | null;
  subtotal: number;
  vat_amount: number;
  service_fee: number;
  delivery_fee: number;
  delivery_option_name: string | null;
  delivery_option_estimated_days: number | null;
}

export interface LiveOrder {
  order_id: string;
  created_at: string;
  order_status: string;
  is_paid: boolean;
  customer_name: string;
  customer_id: string;
  customer_whatsapp: string | null;
  invoice: Invoice | null;
  vehicles: Vehicle[];
  part_count: number;
  parts: Part[];
}

export const LiveOrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<LiveOrder | null>(null);

  const fetchLiveOrders = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await (supabase.rpc as any)('get_live_orders');
    
    if (error) {
      console.error('Error fetching live orders:', error);
      setError('Failed to fetch live orders.');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveOrders();
  }, []);

  const { newOrders, paidOrders } = useMemo(() => {
    const newOrders = orders.filter(o => !o.is_paid);
    const paidOrders = orders.filter(o => o.is_paid);
    return { newOrders, paidOrders };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
        <span className="ml-4 text-lg">Loading Live Orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={fetchLiveOrders} variant="secondary" className="ml-4">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const getOverallDeliveryStatus = (order: LiveOrder): string => {
    if (!order.parts || order.parts.length === 0) {
      return order.order_status; // fallback
    }

    const statuses = order.parts.map(p => p.shipping_status);

    if (statuses.every(s => s === 'delivered')) {
      return 'Delivered';
    }
    if (statuses.some(s => s === 'collected' || s === 'admin_collected')) {
      return 'Delivering';
    }
    if (statuses.some(s => s === 'pending_pickup')) {
      return 'Ready for Pickup';
    }
    
    if (order.is_paid) {
        return 'Processing';
    }

    return order.order_status; // Fallback to the original status from DB
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' = 'secondary';
  
    switch (status) {
      case 'Delivered':
        variant = 'default';
        break;
      case 'Delivering':
        variant = 'secondary';
        break;
      case 'Ready for Pickup':
        variant = 'warning';
        break;
      case 'Processing':
        variant = 'outline';
        break;
    }
  
    return <Badge variant={variant}>{status}</Badge>;
  };

  const renderTable = (orders: LiveOrder[]) => {
    const vehicleDisplay = (vehicles: Vehicle[] | null) => {
      if (!vehicles || vehicles.length === 0) return 'N/A';
      const firstVehicle = `${vehicles[0].year} ${vehicles[0].make} ${vehicles[0].model}`;
      if (vehicles.length > 1) {
        return `${firstVehicle} (+${vehicles.length - 1} more)`;
      }
      return firstVehicle;
    };

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Info</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.order_id}>
              <TableCell>
                <div className="font-medium">#{order.order_id.substring(0, 8)}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{vehicleDisplay(order.vehicles)}</TableCell>
              <TableCell>{order.invoice?.total_amount ? `AED ${order.invoice.total_amount.toFixed(2)}` : 'N/A'}</TableCell>
              <TableCell><StatusBadge status={getOverallDeliveryStatus(order)} /></TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => setSelectedOrder(order)}>View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
       <h2 className="text-2xl font-bold mb-4">Live Orders</h2>
      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New Orders ({newOrders.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid Orders ({paidOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          {newOrders.length > 0 ? renderTable(newOrders) : <p className="text-center py-8 text-gray-500">No new orders.</p>}
        </TabsContent>
        <TabsContent value="paid">
          {paidOrders.length > 0 ? renderTable(paidOrders) : <p className="text-center py-8 text-gray-500">No paid orders.</p>}
        </TabsContent>
      </Tabs>
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}; 