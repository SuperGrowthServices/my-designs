import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, ArrowUpDown } from "lucide-react";
import {
  mockParts,
  mockVehicles,
  Vehicle,
  Part,
} from "@/data/buyerDashboardMockData";
import { DeliveredPartCard } from "./DeliveredPartCard";
import { OrderHistoryHeader } from "./OrderHistoryHeader";
import { OrderHistorySummary } from "./OrderHistorySummary";
import { OrderHistoryFilters } from "./OrderHistoryFilters";
import { OrderHistoryCard } from "./OrderHistoryCard";
import { PartModal } from "./PartModal";
import { ReceiptModal } from "./ReceiptModal";
import { RefundReceiptModal } from "./RefundReceiptModal";

// Create comprehensive order summaries from mock data
const createOrderSummaries = () => {
  const orderIds = [...new Set(mockParts.map(part => part.orderId))];
  
  return orderIds.map(orderId => {
    const orderParts = mockParts.filter(part => part.orderId === orderId && (part.status === 'DELIVERED' || part.status === 'REFUNDED'));
    
    if (orderParts.length === 0) return null;
    
    const hasRefunds = orderParts.some(part => part.status === 'REFUNDED');
    
    const totalParts = orderParts.length;
    const subtotal = orderParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
    const deliveryFee = 50; // Standard delivery fee
    const totalAmount = subtotal + deliveryFee;
    
    // Get the most recent order date
    const orderDate = new Date(Math.max(...orderParts.map(part => new Date(part.orderDate).getTime())));
    const formattedDate = orderDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return {
      id: orderId,
      status: 'Delivered',
      date: formattedDate,
      partCount: totalParts,
      amount: `AED ${totalAmount.toFixed(2)}`,
      subtotal,
      deliveryFee,
      totalAmount,
      hasRefunds: hasRefunds,
    };
  }).filter(Boolean).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const mockOrders = createOrderSummaries();

export const OrderHistoryTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [dateRange, setDateRange] = useState("all");
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);
  const [refundReceiptOrderId, setRefundReceiptOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    let orders = [...mockOrders];

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      switch (dateRange) {
        case "30days": cutoffDate.setDate(now.getDate() - 30); break;
        case "90days": cutoffDate.setDate(now.getDate() - 90); break;
        case "year": cutoffDate.setFullYear(now.getFullYear() - 1); break;
      }
      orders = orders.filter(order => new Date(order.date) >= cutoffDate);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      orders = orders.filter(order => {
        const orderParts = mockParts.filter(part => part.orderId === order.id);
        const vehicleMap = new Map(mockVehicles.map(v => [v.id, v]));
        
        return orderParts.some(part => {
          const vehicle = vehicleMap.get(part.vehicleId);
          const vehicleString = vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.vin}`.toLowerCase() : '';
          return part.name.toLowerCase().includes(searchLower) || 
                 (part.partNumber && part.partNumber.toLowerCase().includes(searchLower)) ||
                 vehicleString.includes(searchLower) ||
                 order.id.toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply sort order
    orders.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return orders;
  }, [searchTerm, sortOrder, dateRange]);
  
  const vehicleMap = useMemo(() => new Map(mockVehicles.map(v => [v.id, v])), []);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSortOrder("newest");
    setDateRange("all");
  }

  const handleViewPartDetails = (partId: string) => {
    const part = mockParts.find(p => p.id === partId);
    if(part) setSelectedPart(part);
  }

  const handleShowReceipt = (orderId: string) => {
    setReceiptOrderId(orderId);
  }

  const handleShowRefundReceipt = (orderId: string) => {
    setRefundReceiptOrderId(orderId);
  }

  return (
    <div className="space-y-6">
      <OrderHistoryHeader />
      <OrderHistorySummary />
      <OrderHistoryFilters onClearFilters={handleClearFilters} />
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Showing {filteredOrders.length} of {mockOrders.length} orders</p>
        {filteredOrders.map(order => (
          <OrderHistoryCard 
            key={order.id} 
            order={order} 
            onViewDetails={handleViewPartDetails}
            onShowReceipt={handleShowReceipt}
            onShowRefundReceipt={handleShowRefundReceipt}
          />
        ))}
      </div>
      <PartModal 
        part={selectedPart}
        vehicles={mockVehicles}
        onOpenChange={() => setSelectedPart(null)}
      />
      <ReceiptModal 
        isOpen={!!receiptOrderId}
        onOpenChange={() => setReceiptOrderId(null)}
        orderId={receiptOrderId}
      />
      <RefundReceiptModal
        isOpen={!!refundReceiptOrderId}
        onOpenChange={() => setRefundReceiptOrderId(null)}
        orderId={refundReceiptOrderId}
      />
    </div>
  );
}; 