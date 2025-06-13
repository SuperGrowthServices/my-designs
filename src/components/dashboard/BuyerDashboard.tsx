import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BellRing, CheckCircle } from 'lucide-react';
import { MyOrders } from './MyOrders';
import { OrderModal } from './OrderModal';
import { useOrderData } from '@/hooks/useOrderData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const BuyerDashboard: React.FC = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { orders, loading, summary, refetchOrders } = useOrderData();

  // Calculate additional metrics for the dashboard
  const dashboardMetrics = useMemo(() => {
    const liveOrders = orders.filter((order: any) => order.status !== 'completed' && order.status !== 'cancelled');
    const ordersReadyForCheckout = orders.filter((order: any) => order.hasAcceptedBids);
    const firstOrderForCheckoutId = ordersReadyForCheckout.length > 0 ? ordersReadyForCheckout[0].id : null;

    return {
      liveOrdersCount: liveOrders.length,
      totalPendingBids: summary.totalPendingBids || 0,
      ordersReadyForCheckoutCount: ordersReadyForCheckout.length,
      firstOrderForCheckoutId
    };
  }, [orders, summary]);

  useEffect(() => {
    const handleOpenModal = () => setIsOrderModalOpen(true);
    window.addEventListener('openOrderModal', handleOpenModal);
    return () => window.removeEventListener('openOrderModal', handleOpenModal);
  }, []);

  const handleCreateOrder = () => {
    setIsOrderModalOpen(true);
  };
  
  const handleOrderCreated = () => {
    setIsOrderModalOpen(false);
    refetchOrders();
  };

  const handleScrollToCheckout = () => {
    if (dashboardMetrics.firstOrderForCheckoutId) {
      const element = document.getElementById(`order-${dashboardMetrics.firstOrderForCheckoutId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <Button onClick={handleCreateOrder}>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Dashboard Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Live Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.liveOrdersCount}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Pending Bids</h3>
          <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.totalPendingBids}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Ready for Checkout</h3>
          <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.ordersReadyForCheckoutCount}</p>
        </div>
      </div>

      {/* Checkout Ready Alert */}
      {dashboardMetrics.ordersReadyForCheckoutCount > 0 && (
        <Alert className="mb-6 border-green-200 bg-green-50 flex items-center justify-between">
          <div className='flex items-center'>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="ml-3">
              <AlertTitle className="text-green-800 font-semibold">You have orders ready for checkout!</AlertTitle>
              <AlertDescription className="text-green-700">
                Proceed to an order to review your accepted bids and complete your purchase.
              </AlertDescription>
            </div>
          </div>
          <Button onClick={handleScrollToCheckout} size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0">
            Go to Order
          </Button>
        </Alert>
      )}

      {/* Legacy Pending Bids Alert (keeping for backward compatibility) */}
      {summary.totalPendingBids > 0 && dashboardMetrics.ordersReadyForCheckoutCount === 0 && (
        <div className="mb-6">
          <Alert className="bg-blue-50 border-blue-200">
            <BellRing className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Action Required</AlertTitle>
            <AlertDescription className="text-blue-700">
              You have <span className="font-semibold">{summary.totalPendingBids} new bid{summary.totalPendingBids !== 1 ? 's' : ''}</span> to review across {summary.ordersWithPendingBidsCount} order{summary.ordersWithPendingBidsCount !== 1 ? 's' : ''}.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <MyOrders orders={orders} loading={loading} refetchOrders={refetchOrders} />

      <OrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderCreated={handleOrderCreated} 
      />
    </>
  );
};