import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MyOrders } from './MyOrders';
import { OrderModal } from './OrderModal';
import { useDashboardData } from '@/hooks/useDashboardData';

export const DashboardHome: React.FC = () => {
  const { liveOrders, loading } = useDashboardData();
  const [showOrderModal, setShowOrderModal] = React.useState(false);

  const handleOrderCreated = () => {
    setShowOrderModal(false);
    // After order creation, user will need to refresh the page to see updates
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your orders.</p>
        </div>
        <Button 
          onClick={() => setShowOrderModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {/* Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg">Loading orders...</div>
            </div>
          ) : (
            <MyOrders />
          )}
        </CardContent>
      </Card>

      {/* Order Creation Modal */}
      {showOrderModal && (
        <OrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
};
