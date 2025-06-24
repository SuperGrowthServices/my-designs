import React from 'react';

const ReportsTab: React.FC = () => (
  <div className="bg-white rounded shadow p-6 text-center">
    <h2 className="text-xl font-semibold mb-4">Reports</h2>
    <div className="mb-4">Auto-generated reports coming soon...</div>
    <div className="flex justify-center gap-4">
      <button className="px-4 py-2 rounded bg-blue-100 text-blue-700">Export CSV</button>
      <button className="px-4 py-2 rounded bg-gray-100 text-gray-700">Export PDF</button>
    </div>
  </div>
);

export default ReportsTab; 