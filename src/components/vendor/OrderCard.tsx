import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Car, Package, Check, Clock, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OrderWithParts } from '@/types/orders';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: OrderWithParts;
  isSelected?: boolean;
  onClick?: (order: OrderWithParts) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isSelected,
  onClick,
}) => {
  // Calculate bid status
  const totalParts = order.parts.length;
  const biddedParts = order.parts.filter(part => part.existing_bid).length;
  const acceptedParts = order.parts.filter(part => part.existing_bid?.status === 'accepted').length;

  const getBidStatus = () => {
    if (acceptedParts > 0) {
      return {
        label: `${acceptedParts} of ${totalParts} Accepted`,
        color: 'bg-green-100 text-green-800',
        icon: Check,
      };
    }
    if (biddedParts === totalParts) {
      return {
        label: 'Fully Bid',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      };
    }
    if (biddedParts > 0) {
      return {
        label: `${biddedParts} of ${totalParts} Bid`,
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      };
    }
    return {
      label: 'New Order',
      color: 'bg-gray-100 text-gray-800',
      icon: Package,
    };
  };

  const status = getBidStatus();
  const StatusIcon = status.icon;

  // Get unique vehicles
  const uniqueVehicles = order.parts.reduce((acc, part) => {
    if (!part.vehicle) return acc;
    const vehicleKey = `${part.vehicle.make}-${part.vehicle.model}-${part.vehicle.year}`;
    if (!acc[vehicleKey]) {
      acc[vehicleKey] = part.vehicle;
    }
    return acc;
  }, {} as Record<string, OrderWithParts['parts'][0]['vehicle']>);

  const vehicles = Object.values(uniqueVehicles).filter(Boolean);
  const hasMultipleVehicles = vehicles.length > 1;
  const hasVehicleInfo = vehicles.length > 0;

  // Create vehicle display text
  const vehicleDisplay = hasMultipleVehicles
    ? vehicles.map(v => v.make).join(', ')
    : hasVehicleInfo
    ? `${vehicles[0].make} ${vehicles[0].model}${vehicles[0].year ? ` ${vehicles[0].year}` : ''}`
    : 'Vehicle info unavailable';

  // Create tooltip content for multiple vehicles
  const vehiclesList = vehicles.map(v => 
    `${v.make} ${v.model}${v.year ? ` ${v.year}` : ''}`
  ).join('\n');

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isSelected ? 'ring-2 ring-blue-500' : 'hover:border-gray-300',
        onClick ? 'cursor-pointer' : ''
      )}
      onClick={onClick ? (e) => onClick(order) : undefined}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header with Vehicle Info */}
        <div className="flex items-start justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {hasMultipleVehicles ? (
                    <Car className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Car className={`w-4 h-4 ${hasVehicleInfo ? 'text-gray-500' : 'text-gray-300'}`} />
                  )}
                  <div>
                    <span className={`font-medium ${hasVehicleInfo ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                      {vehicleDisplay}
                    </span>
                    {hasMultipleVehicles && (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {vehicles.map(v => v.model).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              {hasMultipleVehicles && (
                <TooltipContent>
                  <p className="font-medium">Vehicles in this order:</p>
                  {vehicles.map((v, i) => (
                    <p key={i} className="whitespace-nowrap">
                      {v.make} {v.model} {v.year}
                    </p>
                  ))}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Parts Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {totalParts} {totalParts === 1 ? 'Part' : 'Parts'} Requested
            </span>
          </div>

          {/* Bid Status */}
          <div className="flex items-center gap-2">
            <Badge className={`${status.color} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
          </div>

          {/* Part Names Preview with Other Bids Count */}
          <div className="space-y-2">
            {order.parts.map(part => (
              <div key={part.id} className="flex items-center justify-between text-sm">
                <div className="text-gray-600 truncate">{part.part_name}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
