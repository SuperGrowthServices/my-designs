import React from 'react';
import { LogisticsTable } from '@/components/logistics/LogisticsTable';

const LogisticsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logistics Management</h1>
        <p className="text-gray-500">
          Manage part collections from vendors and deliveries to customers.
        </p>
      </div>
      <LogisticsTable />
    </div>
  );
};

export default LogisticsPage; 