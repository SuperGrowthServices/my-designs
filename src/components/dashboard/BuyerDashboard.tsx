import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BellRing } from 'lucide-react';
import { MyOrders } from './MyOrders';
import { OrderModal } from './OrderModal';
import { useOrderData } from '@/hooks/useOrderData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const BuyerDashboard: React.FC = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { orders, loading, summary, refetchOrders } = useOrderData();

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

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <Button onClick={handleCreateOrder}>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {summary.totalPendingBids > 0 && (
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