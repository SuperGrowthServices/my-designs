import React from 'react';

const OrdersTab: React.FC = () => (
  <div>
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2">Order ID</th>
          <th className="px-4 py-2">Buyer</th>
          <th className="px-4 py-2"># Parts</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Total AED</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-4 py-2">--</td>
          <td className="px-4 py-2">--</td>
          <td className="px-4 py-2">--</td>
          <td className="px-4 py-2">--</td>
          <td className="px-4 py-2">--</td>
          <td className="px-4 py-2">--</td>
        </tr>
      </tbody>
    </table>
    <div className="mt-4 text-gray-500 text-center">Expandable order details coming soon...</div>
  </div>
);

export default OrdersTab; 