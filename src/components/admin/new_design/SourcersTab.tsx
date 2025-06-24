import React from 'react';

const SourcersTab: React.FC = () => (
  <div>
    <div className="mb-4 flex gap-2">
      <button className="px-3 py-1 rounded bg-blue-100 text-blue-700">All</button>
      <button className="px-3 py-1 rounded bg-green-100 text-green-700">Enabled</button>
      <button className="px-3 py-1 rounded bg-gray-100 text-gray-700">Disabled</button>
    </div>
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Quotes Approved</th>
          <th className="px-4 py-2">Orders Handled</th>
          <th className="px-4 py-2">Avg Time to Accept</th>
          <th className="px-4 py-2">Review Completeness</th>
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

export default SourcersTab; 