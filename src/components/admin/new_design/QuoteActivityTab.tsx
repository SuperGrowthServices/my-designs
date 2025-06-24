import React from 'react';

const QuoteActivityTab: React.FC = () => (
  <div>
    <div className="mb-4 flex gap-2">
      <button className="px-3 py-1 rounded bg-blue-100 text-blue-700">All</button>
      <button className="px-3 py-1 rounded bg-green-100 text-green-700">Pending</button>
      <button className="px-3 py-1 rounded bg-yellow-100 text-yellow-700">Accepted</button>
      <button className="px-3 py-1 rounded bg-red-100 text-red-700">Rejected</button>
    </div>
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2">Part Name</th>
          <th className="px-4 py-2">Vendor</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Buyer Budget</th>
          <th className="px-4 py-2">Vendor Price</th>
          <th className="px-4 py-2">Submitted By</th>
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
          <td className="px-4 py-2">--</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default QuoteActivityTab; 