
import React from 'react';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';

interface CompactStatsBarProps {
  stats: {
    openOrders: number;
    quotesSubmitted: number;
    quotesAccepted: number;
    totalEarnings: number;
  };
}

export const CompactStatsBar: React.FC<CompactStatsBarProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Open Orders</div>
            <div className="text-lg font-semibold">{stats.openOrders}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
            <FileText className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Bids Placed</div>
            <div className="text-lg font-semibold">{stats.quotesSubmitted}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Accepted</div>
            <div className="text-lg font-semibold">{stats.quotesAccepted}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Earned</div>
            <div className="text-lg font-semibold">AED {stats.totalEarnings.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
