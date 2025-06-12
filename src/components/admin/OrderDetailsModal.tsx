import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LiveOrder } from './LiveOrdersTable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, MapPin } from 'lucide-react';

// Re-creating simplified versions of the receipt components for use here
// This avoids complex prop drilling and keeps the modal self-contained.

interface ContactLinkProps {
  href: string;
  Icon: React.ElementType;
  children: React.ReactNode;
}

const ContactLink: React.FC<ContactLinkProps> = ({ href, Icon, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
    <Icon className="w-4 h-4" />
    {children}
  </a>
);

const ReceiptDetails: React.FC<{ order: LiveOrder }> = ({ order }) => (
    <div className="mb-6 border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-3">Receipt Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
                <p className="text-muted-foreground">Order ID</p>
                <p>#{order.order_id.substring(0, 8)}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Order Date</p>
                <p>{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p>Stripe</p>
            </div>
            {order.invoice?.stripe_payment_intent_id &&
                <div>
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="truncate">{order.invoice.stripe_payment_intent_id}</p>
                </div>
            }
            <div>
                <p className="text-muted-foreground">Delivery Option</p>
                <p>{order.invoice?.delivery_option_name || 'N/A'}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Address</p>
                <p>{order.invoice?.delivery_address || 'N/A'}</p>
            </div>
        </div>
    </div>
);

const ReceiptItems: React.FC<{ order: LiveOrder }> = ({ order }) => {
    const acceptedBids = order.parts
        .flatMap(part => part.bids?.filter(bid => bid.status === 'accepted').map(bid => ({ ...bid, part_name: part.part_name, quantity: part.quantity })) || [])
        .filter(Boolean);

    return (
        <div className="mb-6 border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Ordered Items</h3>
            <div className="space-y-3">
                {acceptedBids.length > 0 ? (
                    acceptedBids.map((bid, index) => (
                        <div key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded-md">
                            <div>
                                <p className="font-medium">{bid.part_name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {bid.quantity} &bull; Vendor: {bid.vendor_name}</p>
                            </div>
                            <p className="font-semibold">AED {bid.price.toFixed(2)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No accepted bids found for this order.</p>
                )}
            </div>
        </div>
    );
};

const ReceiptSummary: React.FC<{ order: LiveOrder }> = ({ order }) => {
    if (!order.invoice) return null;
    return (
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>AED {order.invoice.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">VAT (5%):</span><span>AED {order.invoice.vat_amount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service Fee (5%):</span><span>AED {order.invoice.service_fee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee:</span><span>AED {order.invoice.delivery_fee.toFixed(2)}</span></div>
                <hr className="my-2"/>
                <div className="flex justify-between font-bold text-base"><span >Total Paid:</span><span>AED {order.invoice.total_amount.toFixed(2)}</span></div>
            </div>
        </div>
    );
};

export const OrderDetailsModal: React.FC<{ order: LiveOrder | null; isOpen: boolean; onClose: () => void; }> = ({ order, isOpen, onClose }) => {
  if (!order) return null;
  
  const getGoogleMapsLink = (address: string) => `https://www.google.com/maps?q=${encodeURIComponent(address)}`;

  const primaryVendorBid = useMemo(() => {
    if (!order || !order.parts) return null;
    for (const part of order.parts) {
      const acceptedBid = part.bids?.find(b => b.status === 'accepted');
      if (acceptedBid) return acceptedBid;
    }
    return null;
  }, [order]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details #{order.order_id.substring(0, 8)}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-6">
            <div className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Buyer Card */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-semibold text-lg mb-2">Buyer Details</h3>
                        <p className="font-medium">{order.customer_name}</p>
                        {order.invoice?.delivery_address && 
                        <p className="text-sm text-muted-foreground">
                            {order.invoice.delivery_address}
                            {order.customer_whatsapp && ` Phone: ${order.customer_whatsapp}`}
                        </p>
                        }
                        <div className="flex items-center gap-4 mt-2">
                        {order.customer_whatsapp && <ContactLink href={`https://wa.me/${order.customer_whatsapp}`} Icon={MessageSquare}>WhatsApp</ContactLink>}
                        {order.invoice?.delivery_address && <ContactLink href={getGoogleMapsLink(order.invoice.delivery_address)} Icon={MapPin}>View on Map</ContactLink>}
                        </div>
                    </div>
                    {/* Vendor Card */}
                    {primaryVendorBid ? (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-lg mb-2">Vendor Details</h3>
                            <p className="font-medium">{primaryVendorBid.vendor_name}</p>
                            {primaryVendorBid.vendor_pickup_address && 
                            <p className="text-sm text-muted-foreground">
                                {primaryVendorBid.vendor_pickup_address}
                                {primaryVendorBid.vendor_whatsapp && ` Phone: ${primaryVendorBid.vendor_whatsapp}`}
                            </p>
                            }
                            <div className="flex items-center gap-4 mt-2">
                            {primaryVendorBid.vendor_whatsapp && <ContactLink href={`https://wa.me/${primaryVendorBid.vendor_whatsapp}`} Icon={MessageSquare}>WhatsApp</ContactLink>}
                            {primaryVendorBid.vendor_maps_url && <ContactLink href={primaryVendorBid.vendor_maps_url} Icon={MapPin}>View on Map</ContactLink>}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No vendor assigned yet.</p>
                        </div>
                    )}
                </div>

                <ReceiptDetails order={order} />
                <ReceiptItems order={order} />
                <ReceiptSummary order={order} />
            </div>
        </ScrollArea>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 