import React from 'react';

const InvoicesTab: React.FC = () => (
  <div>
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2">Invoice ID</th>
          <th className="px-4 py-2">Buyer</th>
          <th className="px-4 py-2">Driver</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Delivery Fee</th>
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
          <td className="px-4 py-2">--</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default InvoicesTab; 