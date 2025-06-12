
import React from 'react';
import { Clock, CheckCircle, Package, Truck } from 'lucide-react';

interface OrderProgressTrackerProps {
  orders: any[];
}

export const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ orders }) => {
  const getProgressSteps = (order: any) => {
    const steps = [
      { 
        label: 'Order Created', 
        icon: Package, 
        completed: true,
        timestamp: order.created_at 
      },
      { 
        label: 'Bids Received', 
        icon: Clock, 
        completed: order.parts?.some((part: any) => part.bids?.length > 0),
        timestamp: order.parts?.find((part: any) => part.bids?.length > 0)?.bids?.[0]?.created_at
      },
      { 
        label: 'Bid Accepted', 
        icon: CheckCircle, 
        completed: order.hasAcceptedBids,
        timestamp: order.parts?.find((part: any) => part.bids?.some((bid: any) => bid.status === 'accepted'))?.bids?.find((bid: any) => bid.status === 'accepted')?.updated_at
      },
      { 
        label: 'Ready for Checkout', 
        icon: Truck, 
        completed: order.status === 'ready_for_checkout',
        timestamp: order.status === 'ready_for_checkout' ? order.updated_at : null
      }
    ];
    return steps;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'ready_for_checkout': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-6">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No active orders to track</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.slice(0, 2).map((order) => {
        const steps = getProgressSteps(order);
        const currentStep = steps.findIndex(step => !step.completed);
        const progress = currentStep === -1 ? 100 : (currentStep / steps.length) * 100;

        return (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{Math.round(progress)}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between text-xs">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <Icon className={`w-4 h-4 mb-1 ${step.completed ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-center ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
