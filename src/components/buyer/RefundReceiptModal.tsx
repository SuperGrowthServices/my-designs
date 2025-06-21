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

interface RefundReceiptModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderId: string | null;
}

const mockBuyerInfo = {
    name: "SGS Services",
    email: "hello@sgsservices.ae",
    phone: "+971 50 123 4567",
    address: "123 Business Bay, Dubai, UAE"
};

export const RefundReceiptModal = ({ isOpen, onOpenChange, orderId }: RefundReceiptModalProps) => {
  if (!orderId) return null;
  
  const refundedParts = mockParts.filter(p => p.orderId === orderId && p.status === 'REFUNDED');
  if (refundedParts.length === 0) return null;

  const refundDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
  
  const refundTotal = refundedParts.reduce((sum, part) => sum + (part.price || 0) * part.quantity, 0);

  const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`;
  
  const handlePrint = () => {
      window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 flex flex-col max-h-[90vh]">
        <div id="refund-receipt-content" className="p-8 overflow-y-auto">
            {/* Header */}
            <DialogHeader className="mb-8 text-left">
                <DialogTitle className="text-3xl font-bold">Refund Receipt</DialogTitle>
                <div className="flex justify-between text-sm pt-2">
                    <div>
                        <p className="text-muted-foreground">Original Order ID: <span className="font-medium text-foreground">{orderId}</span></p>
                        <p className="text-muted-foreground">Refund Date: <span className="font-medium text-foreground">{refundDate}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-orange-600">Status: Refund Processed</p>
                    </div>
                </div>
            </DialogHeader>

            {/* Buyer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
                 <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Refund Issued To</h3>
                     <div className="text-foreground">
                        <p>{mockBuyerInfo.name}</p>
                        <p>{mockBuyerInfo.email}</p>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Credit Note</h3>
                     <p className="text-sm text-muted-foreground">This credit note confirms the refund for the items listed below.</p>
                </div>
            </div>

            {/* Refunded Parts */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Refunded Items</h3>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="text-left p-3 font-semibold text-foreground">Part Name</th>
                                <th className="text-left p-3 font-semibold text-foreground">Part Number</th>
                                <th className="text-center p-3 font-semibold text-foreground">Qty</th>
                                <th className="text-right p-3 font-semibold text-foreground">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refundedParts.map(part => (
                                <tr key={part.id} className="border-t">
                                    <td className="p-2">{part.name}</td>
                                    <td className="p-2">{part.partNumber}</td>
                                    <td className="text-center p-2">{part.quantity}</td>
                                    <td className="text-right p-2">{formatCurrency(part.price * part.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-end mt-8">
                <div className="w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                        <span>Total Refunded</span>
                        <span>{formatCurrency(refundTotal)}</span>
                    </div>
                </div>
            </div>
             <p className="text-xs text-muted-foreground text-center mt-8">The refunded amount will be returned via the original payment method.</p>
        </div>
        
        <DialogFooter className="p-4 bg-muted border-t sm:justify-end print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Refund Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 