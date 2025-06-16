
import React from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, Package, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsCenterProps {
  orders: any[];
  stats: any;
  onProceedToCheckout?: (orderId: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ 
  orders, 
  stats, 
  onProceedToCheckout 
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return { date: 'Recently', time: '' };
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return { date: 'Recently', time: '' };
      }
      
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: 'Recently', time: '' };
    }
  };

  const generateNotifications = () => {
    const notifications = [];

    // PRIORITY 1: Orders ready for checkout (using hasAcceptedBids)
    const readyForCheckout = orders.filter(order => order.hasAcceptedBids);
    readyForCheckout.forEach(order => {
      const acceptedBidsCount = order.parts?.reduce((count: number, part: any) => 
        count + (part.bids?.filter((bid: any) => bid.status === 'accepted').length || 0), 0
      ) || 0;
      
      notifications.push({
        id: `checkout-ready-${order.id}`,
        type: 'checkout',
        icon: CreditCard,
        title: 'Ready for Checkout!',
        message: `Order #${order.id.slice(0, 8)} with ${acceptedBidsCount} accepted bid${acceptedBidsCount > 1 ? 's' : ''} is ready for payment`,
        timestamp: order.updated_at || order.created_at,
        actionable: true,
        orderId: order.id,
        priority: 1
      });
    });

    // Only show other notifications if there are fewer than 2 checkout-ready notifications
    if (readyForCheckout.length < 2) {
      // PRIORITY 2: Orders with new bids
      const ordersWithNewBids = orders.filter(order => 
        !order.hasAcceptedBids && order.parts?.some((part: any) => 
          part.bids?.some((bid: any) => bid.status === 'pending')
        )
      );

      ordersWithNewBids.slice(0, 3 - readyForCheckout.length).forEach(order => {
        const newBidsCount = order.parts?.reduce((count: number, part: any) => 
          count + (part.bids?.filter((bid: any) => bid.status === 'pending').length || 0), 0
        );
        
        if (newBidsCount > 0) {
          notifications.push({
            id: `new-bids-${order.id}`,
            type: 'info',
            icon: Bell,
            title: 'New Bids Received',
            message: `${newBidsCount} new bid${newBidsCount > 1 ? 's' : ''} for Order #${order.id.slice(0, 8)}`,
            timestamp: order.updated_at || order.created_at,
            actionable: false,
            orderId: order.id,
            priority: 2
          });
        }
      });

      // PRIORITY 3: Orders with no bids after 24 hours (only if space available)
      if (notifications.length < 3) {
        const oldOrders = orders.filter(order => {
          const created = new Date(order.created_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
          return hoursDiff > 24 && !order.parts?.some((part: any) => part.bids?.length > 0);
        });

        oldOrders.slice(0, 3 - notifications.length).forEach(order => {
          notifications.push({
            id: `no-bids-${order.id}`,
            type: 'warning',
            icon: AlertCircle,
            title: 'No Bids Yet',
            message: `Order #${order.id.slice(0, 8)} hasn't received bids. Consider updating part details.`,
            timestamp: order.created_at,
            actionable: false,
            priority: 3
          });
        });
      }

      // PRIORITY 4: Welcome message (only if space available and first order)
      if (notifications.length < 3 && stats.totalOrders === 1) {
        notifications.push({
          id: 'welcome',
          type: 'success',
          icon: Package,
          title: 'Welcome to EasyCarParts!',
          message: 'You\'ve created your first order. Vendors will start bidding soon.',
          timestamp: new Date().toISOString(),
          actionable: false,
          priority: 4
        });
      }
    }

    // Sort by priority (lowest number = highest priority)
    return notifications.sort((a, b) => a.priority - b.priority);
  };

  const notifications = generateNotifications();

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'checkout': 
        return 'text-white bg-gradient-to-r from-green-600 to-green-700 border-green-600 shadow-lg';
      case 'success': 
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': 
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': 
        return 'text-red-600 bg-red-50 border-red-200';
      default: 
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'checkout' && notification.actionable && onProceedToCheckout) {
      onProceedToCheckout(notification.orderId);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-6">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No new notifications</p>
        <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const Icon = notification.icon;
        const isCheckout = notification.type === 'checkout';
        const { date, time } = formatDate(notification.timestamp);
        
        return (
          <div 
            key={notification.id} 
            className={`border rounded-lg p-4 ${getNotificationStyle(notification.type)} ${
              notification.actionable ? 'cursor-pointer hover:shadow-lg transition-all duration-200' : ''
            } ${isCheckout ? 'relative overflow-hidden' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            {isCheckout && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-700/10 animate-pulse"></div>
            )}
            
            <div className="relative flex items-start space-x-3">
              <div className={`p-1 rounded-full ${isCheckout ? 'bg-white/20' : ''}`}>
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isCheckout ? 'text-white' : ''}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isCheckout ? 'text-white' : ''}`}>
                      {notification.title}
                    </p>
                    <p className={`text-xs mt-1 leading-relaxed ${isCheckout ? 'text-white/90' : ''}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-2 opacity-75 ${isCheckout ? 'text-white/70' : ''}`}>
                      {time ? `${date} • ${time}` : date}
                    </p>
                  </div>
                  
                  {isCheckout && notification.actionable && onProceedToCheckout && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProceedToCheckout(notification.orderId);
                      }}
                      className="ml-3 bg-white text-green-700 hover:bg-gray-100 font-semibold shadow-md"
                    >
                      Checkout Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
