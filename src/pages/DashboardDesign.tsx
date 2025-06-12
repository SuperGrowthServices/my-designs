import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { BuyerDashboard_Design } from '@/components/dashboard/BuyerDashboard_Design';

// This is a placeholder for the props the real layout might need.
const dummyProfile = {
  full_name: 'Designer',
  business_name: 'Design Mode'
};

const DashboardDesign = () => {
  return (
    // We reuse the existing layout for consistency
    <DashboardLayout
      activeTab="home"
      onTabChange={() => {}} // No-op for design mode
      userProfile={dummyProfile}
      showVendorSwitch={false}
      onSwitchToVendor={() => {}} // No-op for design mode
    >
      <BuyerDashboard_Design />
    </DashboardLayout>
  );
};

export default DashboardDesign; 