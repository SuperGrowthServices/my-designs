import React from 'react';

const BuyersTab: React.FC = () => (
  <div>
    <div className="mb-4 flex gap-2">
      <button className="px-3 py-1 rounded bg-blue-100 text-blue-700">Active</button>
      <button className="px-3 py-1 rounded bg-gray-100 text-gray-700">Inactive</button>
      <button className="px-3 py-1 rounded bg-yellow-100 text-yellow-700">High-Spend</button>
    </div>
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Phone</th>
          <th className="px-4 py-2">Email</th>
          <th className="px-4 py-2"># Orders</th>
          <th className="px-4 py-2">Last Order Date</th>
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
  </div>
);

export default BuyersTab; 