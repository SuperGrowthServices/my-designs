import React from 'react';
import { Button } from '@/components/ui/button';

const metrics = [
  { label: 'Total Orders', value: '1,245' },
  { label: 'Active Orders', value: '87' },
  { label: 'Delivered Orders', value: '1,120' },
  { label: 'Total Revenue', value: 'AED 2,340,000' },
  { label: 'Vendors', value: '56' },
  { label: 'Buyers', value: '1,032' },
  { label: 'Outstanding Payments', value: 'AED 120,000' },
  { label: 'Pending Vendor Quotes', value: '14' },
  { label: 'Flagged Issues', value: '3' },
];

const DashboardTab: React.FC = () => (
  <div className="relative">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Admin Overview</h2>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow" size="lg">
        + Create Order
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center min-h-[120px]">
          <span className="text-lg font-semibold text-gray-800">{metric.label}</span>
          <span className="text-2xl text-blue-600 mt-2">{metric.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default DashboardTab; 