
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BidsList } from './BidsList';
import { Car } from 'lucide-react';

interface PartCardProps {
  part: any;
  onBidUpdate?: () => void;
}

export const PartCard: React.FC<PartCardProps> = ({ part, onBidUpdate }) => {
  return (
    <div className="border rounded-lg p-3 bg-white">
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* Part Details - Left Side */}
        <div className="col-span-8 flex items-start gap-2">
          <Car className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm">{part.part_name}</h4>
            <p className="text-xs text-gray-600">
              {part.vehicles?.make} {part.vehicles?.model} {part.vehicles?.year}
            </p>
            {part.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{part.description}</p>
            )}
          </div>
        </div>
        
        {/* Quantity Badge - Right Side */}
        <div className="col-span-4 flex justify-end">
          <Badge variant="outline" className="text-xs">Qty: {part.quantity}</Badge>
        </div>
      </div>
      
      {/* Bids Section */}
      <BidsList bids={part.bids || []} onBidUpdate={onBidUpdate} />
    </div>
  );
};
