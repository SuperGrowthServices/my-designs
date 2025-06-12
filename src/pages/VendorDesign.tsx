import React, { useState } from 'react';
import { VendorDashboardLayout } from '@/components/vendor/VendorDashboardLayout';
import { mockVendorData, VendorOrder, MyQuote } from '@/data/mockVendorData';
import { VendorHome_Design } from '@/components/vendor/design/VendorHome_Design';

const VendorDesign = () => {
  const [orders, setOrders] = useState<VendorOrder[]>(mockVendorData);

  const dummyProfile = { business_name: 'Design Sandbox Vendor' };

  // A special function to handle quote submission, as it changes the structure
  const handleAddQuote = (orderId: string, partId: string, newQuote: MyQuote) => {
      setOrders(prevOrders => {
          const newOrders = JSON.parse(JSON.stringify(prevOrders)); // Deep copy
          const order = newOrders.find(o => o.id === orderId);
          if (order) {
              for (const vehicle of order.vehicles) {
                  const part = vehicle.parts.find(p => p.id === partId);
                  if (part) {
                      part.myQuote = newQuote;
                      break;
                  }
              }
          }
          return newOrders;
      });
  };

  return (
    <VendorDashboardLayout
      activeTab={'home'} // Set a single, static active tab
      onTabChange={() => {}} // No-op
      userProfile={dummyProfile}
      onSwitchToBuyer={() => alert('Navigation disabled in design mode.')}
      isDesignMode={true}
    >
      <VendorHome_Design orders={orders} onAddQuote={handleAddQuote} />
    </VendorDashboardLayout>
  );
};

export default VendorDesign; 