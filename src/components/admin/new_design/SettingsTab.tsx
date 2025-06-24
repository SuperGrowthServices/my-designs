import React from 'react';

const SettingsTab: React.FC = () => (
  <div className="bg-white rounded shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Settings</h2>
    <ul className="list-disc pl-6 space-y-2 text-gray-700">
      <li>Admin Users Management</li>
      <li>Notification Triggers</li>
      <li>Update Platform-Wide Configs (Service Fee %, VAT, etc.)</li>
    </ul>
    <div className="mt-6 text-gray-400">Settings management UI coming soon...</div>
  </div>
);

export default SettingsTab; 