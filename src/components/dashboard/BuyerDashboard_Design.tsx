import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BellRing, CheckCircle } from 'lucide-react';
import { MyOrders_Design } from './MyOrders_Design';
import { mockDashboardData, Order } from '@/data/mockDashboardData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// A placeholder for the modal since its functionality is out of scope for the design review.
const PlaceholderOrderModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '8px' }}>
        <h2 className="text-lg font-bold mb-4">New Order Modal (Placeholder)</h2>
        <p>This is a placeholder. Functionality for creating new orders is not part of this design review.</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export const BuyerDashboard_Design: React.FC = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  // Use state to hold our mock data so we can interact with it
  const [orders, setOrders] = useState<Order[]>(mockDashboardData);

  // Calculate summary metrics from the current state of the mock data
  const summary = useMemo(() => {
    const liveOrders = orders.filter(o => o.status !== 'COMPLETED_ARCHIVED');
    const totalPendingQuotes = liveOrders.reduce((acc, order) => {
      return acc + order.vehicles.reduce((vehicleAcc, v) => {
        return vehicleAcc + v.parts.reduce((partAcc, p) => {
          return partAcc + (p.status === 'QUOTES_RECEIVED' ? p.quotes.length : 0);
        }, 0);
      }, 0);
    }, 0);
    
    const ordersReadyForCheckout = liveOrders.filter(o => o.status === 'PARTIALLY_ACCEPTED');

    return {
      liveOrdersCount: liveOrders.length,
      totalPendingQuotes,
      ordersReadyForCheckoutCount: ordersReadyForCheckout.length,
      firstOrderForCheckoutId: ordersReadyForCheckout.length > 0 ? ordersReadyForCheckout[0].id : null
    };
  }, [orders]);

  // This function will allow child components to update the state
  const updateOrderState = (updatedOrder: Order) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleScrollToCheckout = () => {
    if (summary.firstOrderForCheckoutId) {
        const element = document.getElementById(`order-${summary.firstOrderForCheckoutId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders (Design Sandbox)</h1>
        <Button onClick={() => setIsOrderModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Section 4: Dashboard Notifications & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Live Orders</h3>
              <p className="text-3xl font-bold text-gray-900">{summary.liveOrdersCount}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Pending Quotes</h3>
              <p className="text-3xl font-bold text-gray-900">{summary.totalPendingQuotes}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Ready for Checkout</h3>
              <p className="text-3xl font-bold text-gray-900">{summary.ordersReadyForCheckoutCount}</p>
          </div>
      </div>
      
      {summary.ordersReadyForCheckoutCount > 0 && (
        <Alert className="mb-6 border-green-200 bg-green-50 flex items-center justify-between">
            <div className='flex items-center'>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="ml-3">
                  <AlertTitle className="text-green-800 font-semibold">You have orders ready for checkout!</AlertTitle>
                  <AlertDescription className="text-green-700">
                      Proceed to an order to review your accepted quotes and complete your purchase.
                  </AlertDescription>
              </div>
            </div>
            <Button onClick={handleScrollToCheckout} size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0">
                Go to Order
            </Button>
        </Alert>
      )}

      {/* Pass the mock data and the update function to the list component */}
      <MyOrders_Design orders={orders} onUpdateOrder={updateOrderState} />

      <PlaceholderOrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </>
  );
}; 