import React from 'react';
import { DriverLayout } from '@/components/driver/DriverLayout';
import { LogisticsTable } from '@/components/logistics/LogisticsTable';

export const DriverDashboardPage = () => {
  return (
    <DriverLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Deliveries</h1>
          <p className="text-gray-500">
            Manage your pickups and deliveries
          </p>
        </div>
        <LogisticsTable isDriverView />
      </div>
    </DriverLayout>
  );
};