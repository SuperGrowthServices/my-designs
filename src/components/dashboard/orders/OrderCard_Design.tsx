import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Car, Package, CheckCircle, Hourglass, ShoppingCart } from 'lucide-react';
import { Order, Part, Vehicle, Quote } from '@/data/mockDashboardData';
import { QuoteList_Design } from './QuoteList_Design';

interface OrderCardProps {
  order: Order;
  onUpdateOrder: (order: Order) => void;
}

// Modal component to be shown when reviewing quotes
const QuoteReviewModal = ({ isOpen, onClose, part, onAcceptQuote }: { isOpen: boolean, onClose: () => void, part: Part | null, onAcceptQuote: (partId: string, quoteId: string) => void }) => {
    if (!isOpen || !part) return null;

    return (
        // Add onClick to overlay to close modal
        <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Add stopPropagation to prevent clicks inside from closing */}
            <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px' }}>
                <h2 className="text-xl font-bold mb-4">Review Quotes for {part.partName}</h2>
                <QuoteList_Design 
                    part={part}
                    onAcceptQuote={onAcceptQuote}
                />
                <Button onClick={onClose} variant="outline" className="mt-4 w-full">Close</Button>
            </div>
        </div>
    );
};


export const OrderCard_Design: React.FC<OrderCardProps> = ({ order, onUpdateOrder }) => {
  const [expanded, setExpanded] = useState(true); // Default to expanded for design review
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const { vehicleDisplay, totalParts, totalPendingQuotes } = useMemo(() => {
    const vehicles = order.vehicles.map(v => v.vehicleName).join(', ');
    const partsCount = order.vehicles.reduce((sum, v) => sum + v.parts.length, 0);
    const quotesCount = order.vehicles.reduce((sum, v) => {
        return sum + v.parts.reduce((partSum, p) => partSum + (p.status === 'QUOTES_RECEIVED' ? p.quotes.length : 0), 0);
    }, 0);
    return { vehicleDisplay: vehicles, totalParts: partsCount, totalPendingQuotes: quotesCount };
  }, [order]);

  const getOrderStatus = () => {
    if (order.status === 'PARTIALLY_ACCEPTED') return { label: 'Ready for Checkout', icon: ShoppingCart, color: 'bg-green-100 text-green-800' };
    if (totalPendingQuotes > 0) return { label: 'Review Quotes', icon: Hourglass, color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'New Order', icon: Package, color: 'bg-blue-100 text-blue-800' };
  };

  const status = getOrderStatus();
  const StatusIcon = status.icon;

  const handleAcceptQuote = (partId: string, quoteId: string) => {
    const updatedOrder = JSON.parse(JSON.stringify(order)); // Deep copy
    let partFound = false;
    for (const vehicle of updatedOrder.vehicles) {
        for (const part of vehicle.parts) {
            if (part.id === partId) {
                part.status = 'QUOTE_ACCEPTED';
                partFound = true;
                break;
            }
        }
        if(partFound) break;
    }
    updatedOrder.status = 'PARTIALLY_ACCEPTED';
    onUpdateOrder(updatedOrder);
    setSelectedPart(null); // Close modal
  };

  const handleCheckout = () => {
      const updatedOrder = { ...order, vehicles: [] as Vehicle[] };
      let remainingParts = false;

      order.vehicles.forEach(v => {
          const vehicleWithRemainingParts = { ...v, parts: [] as Part[] };
          v.parts.forEach(p => {
              if (p.status !== 'QUOTE_ACCEPTED') {
                  vehicleWithRemainingParts.parts.push(p);
                  remainingParts = true;
              }
          });
          if (vehicleWithRemainingParts.parts.length > 0) {
              updatedOrder.vehicles.push(vehicleWithRemainingParts);
          }
      });
      
      if (!remainingParts) {
          updatedOrder.status = 'COMPLETED_ARCHIVED';
      } else {
          updatedOrder.status = 'LIVE';
      }

      onUpdateOrder(updatedOrder);
  };
  
  const getPartQuoteSummary = (part: Part) => {
    if (part.status === 'QUOTE_ACCEPTED') {
      return <Badge className="bg-green-100 text-green-800">Quote Accepted</Badge>;
    }
    if (part.quotes.length === 0) {
      return <Badge variant="outline">No Quotes Yet</Badge>;
    }
    const min = Math.min(...part.quotes.map(b => b.price));
    const max = Math.max(...part.quotes.map(b => b.price));
    return (
      <Badge className="bg-blue-100 text-blue-800">
        {part.quotes.length} Pending Quotes ({`AED ${min} - ${max}`})
      </Badge>
    );
  };

  return (
    <>
      <Card id={`order-${order.id}`} className="mb-4 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg border scroll-mt-20">
        <CardHeader className="p-4 cursor-pointer bg-gray-50/50 hover:bg-gray-100/60" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Car className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <h3 className="font-semibold text-lg truncate" title={vehicleDisplay}>{vehicleDisplay}</h3>
              </div>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                <span>Order {order.orderId}</span>
                <Badge variant="primary">{totalParts} Parts Requested</Badge>
                <Badge variant="secondary">{totalPendingQuotes} Pending Quotes</Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Badge className={`${status.color} flex items-center gap-1.5 text-xs`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
              </Badge>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CardHeader>
        
        {expanded && (
          <CardContent className="p-4 border-t">
            <div className="space-y-6">
              {order.vehicles.map((vehicle) => (
                <div key={vehicle.id}>
                  <h4 className="font-semibold mb-3 text-gray-800">{vehicle.vehicleName}</h4>
                  <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                    {vehicle.parts.map((part) => (
                      <div key={part.id} className="p-4 rounded-lg bg-white border">
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="font-medium">{part.partName}</div>
                              <div className="mt-2">{getPartQuoteSummary(part)}</div>
                           </div>
                           {part.quotes.length > 0 && part.status !== 'QUOTE_ACCEPTED' && (
                              <Button variant="default" size="sm" onClick={() => setSelectedPart(part)}>
                                  Review Quotes
                              </Button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t">
              {order.status === 'PARTIALLY_ACCEPTED' && (
                <Button onClick={handleCheckout} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  Proceed to Checkout
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
      
      <QuoteReviewModal 
        isOpen={!!selectedPart}
        onClose={() => setSelectedPart(null)}
        part={selectedPart}
        onAcceptQuote={handleAcceptQuote}
      />
    </>
  );
}; 