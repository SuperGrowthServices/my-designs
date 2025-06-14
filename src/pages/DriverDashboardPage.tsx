import React from 'react';
import { DriverLayout } from '@/components/driver/DriverLayout';
import { DriverDashboard } from '@/components/driver/DriverDashboard';

export const DriverDashboardPage = () => {
  return (
    <DriverLayout>
      <DriverDashboard />
    </DriverLayout>
  );
};