import React from 'react';

const VendorsTab: React.FC = () => (
  <div>
    <div className="mb-4 flex gap-2">
      <button className="px-3 py-1 rounded bg-blue-100 text-blue-700">All Areas</button>
      <button className="px-3 py-1 rounded bg-green-100 text-green-700">Active</button>
      <button className="px-3 py-1 rounded bg-gray-100 text-gray-700">Inactive</button>
    </div>
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2">Vendor Name</th>
          <th className="px-4 py-2">Phone</th>
          <th className="px-4 py-2">Address</th>
          <th className="px-4 py-2"># Quotes</th>
          <th className="px-4 py-2">Quote Win Rate</th>
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

export default VendorsTab; 