import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mockParts, mockVehicles, Part, Vehicle } from "@/data/buyerDashboardMockData";
import { Printer } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

interface ReceiptModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderId: string | null;
  injectedParts?: any[]; // For delivery portal synthetic data
}

const mockBuyerInfo = {
    name: "SGS Services",
    email: "hello@sgsservices.ae",
    phone: "+971 50 123 4567",
    address: "123 Business Bay, Dubai, UAE"
};

const groupPartsByVehicle = (parts: Part[]) => {
    return parts.reduce((acc, part) => {
        const key = part.vehicleId;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(part);
        return acc;
    }, {} as Record<string, Part[]>);
};

export const ReceiptModal = ({ isOpen, onOpenChange, orderId, injectedParts }: ReceiptModalProps) => {
  if (!orderId) return null;
  
  const orderParts = injectedParts
    ? injectedParts
    : mockParts.filter(p => p.orderId === orderId && (p.status === 'DELIVERED' || p.status === 'REFUNDED'));
  if (orderParts.length === 0) return null;

  const orderDate = new Date(orderParts[0].orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
  
  const groupedParts = groupPartsByVehicle(orderParts);
  const vehicleIds = Object.keys(groupedParts);

  const subtotal = orderParts.reduce((sum, part) => sum + (part.price || 0) * part.quantity, 0);
  const deliveryFee = 50; // Standard delivery fee
  const grandTotal = subtotal + deliveryFee;

  const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`;
  
  const handlePrint = () => {
      window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 flex flex-col max-h-[90vh]">
        <div id="receipt-content" className="p-8 overflow-y-auto">
            {/* Header */}
            <DialogHeader className="mb-8 text-left">
                <DialogTitle className="text-3xl font-bold">Order Receipt</DialogTitle>
                <div className="flex justify-between text-sm pt-2">
                    <div>
                        <p className="text-muted-foreground">Receipt ID: <span className="font-medium text-foreground">{orderId}</span></p>
                        <p className="text-muted-foreground">Order Date: <span className="font-medium text-foreground">{orderDate}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-green-600">Status: Delivered</p>
                        <p className="text-xs text-muted-foreground mt-1">Prices include VAT and Service Charge</p>
                    </div>
                </div>
            </DialogHeader>

            {/* Buyer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Buyer Information</h3>
                    <div className="text-foreground">
                        <p>{mockBuyerInfo.name}</p>
                        <p>{mockBuyerInfo.email}</p>
                        <p>{mockBuyerInfo.phone}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Delivery Address</h3>
                    <div className="text-foreground">
                        <p>{mockBuyerInfo.address}</p>
                    </div>
                </div>
            </div>

            {/* Parts Breakdown */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Parts Breakdown</h3>
                {vehicleIds.map(vehicleId => {
                    const vehicle = mockVehicles.find(v => v.id === vehicleId);
                    const vehicleParts = groupedParts[vehicleId];
                    return (
                        <div key={vehicleId}>
                            {vehicle && (
                                <h4 className="font-semibold mb-2">{vehicle.make} {vehicle.model} - <span className="text-muted-foreground">{vehicle.vin}</span></h4>
                            )}
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="text-left p-3 font-semibold text-foreground">Part Name</th>
                                            <th className="text-left p-3 font-semibold text-foreground">Part Number</th>
                                            <th className="text-center p-3 font-semibold text-foreground">Qty</th>
                                            <th className="text-right p-3 font-semibold text-foreground">Unit Price</th>
                                            <th className="text-right p-3 font-semibold text-foreground">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicleParts.map(part => (
                                            <tr key={part.id} className="border-t">
                                                <td className="p-2">
                                                    {part.name}
                                                    {part.status === 'REFUNDED' && <Badge variant="outline" className="ml-2 border-orange-500 text-orange-500">Refunded</Badge>}
                                                </td>
                                                <td className="p-2">{part.partNumber}</td>
                                                <td className="text-center p-2">{part.quantity}</td>
                                                <td className="text-right p-2">{formatCurrency(part.price)}</td>
                                                <td className="text-right p-2">{formatCurrency(part.price * part.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-8">
                <div className="w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                        <span>Grand Total</span>
                        <span>{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
            </div>
             <p className="text-xs text-muted-foreground text-center mt-8">All prices include VAT and Service Charge</p>
        </div>
        
        <DialogFooter className="p-4 bg-muted border-t sm:justify-end print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
          </Button>
        </DialogFooter>
        <style>{`
          @media print {
            body > * {
              display: none;
            }
            .radix-dialog-content-wrapper {
              display: block !important;
            }
            #receipt-content {
              display: block;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}; 