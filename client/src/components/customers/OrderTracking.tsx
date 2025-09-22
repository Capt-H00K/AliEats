import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { subscribeToOrders } from '@/services/realtime';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, User, CheckCircle, Truck, MapPin, Phone } from 'lucide-react';

export const OrderTracking: React.FC = () => {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToOrders(
      (fetchedOrders) => {
        const customerOrders = fetchedOrders.filter(order => order.customerId === user.id);
        
        // Separate active and completed orders
        const active = customerOrders.filter(order => 
          !['completed', 'cancelled', 'delivered'].includes(order.status)
        );
        const completed = customerOrders.filter(order => 
          ['completed', 'cancelled', 'delivered'].includes(order.status)
        );
        
        setActiveOrders(active);
        setCompletedOrders(completed);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const getStatusDisplay = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return {
          text: 'Looking for drivers...',
          icon: <Clock className="h-4 w-4 animate-spin" />,
          color: 'bg-yellow-500',
          description: 'We\'re finding the best driver for your order'
        };
      case 'accepted':
        return {
          text: 'Driver found!',
          icon: <User className="h-4 w-4" />,
          color: 'bg-blue-500',
          description: `${order.driverName || 'Your driver'} will pick up your order`
        };
      case 'preparing':
        return {
          text: 'Being prepared',
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'bg-orange-500',
          description: 'The restaurant is preparing your order'
        };
      case 'ready':
        return {
          text: 'Ready for pickup',
          icon: <Truck className="h-4 w-4" />,
          color: 'bg-purple-500',
          description: 'Your order is ready and waiting for pickup'
        };
      case 'picked_up':
        return {
          text: 'On the way',
          icon: <MapPin className="h-4 w-4" />,
          color: 'bg-green-500',
          description: 'Your driver is on the way to deliver your order'
        };
      case 'delivered':
        return {
          text: 'Delivered',
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'bg-green-600',
          description: 'Your order has been delivered successfully'
        };
      case 'cancelled':
        return {
          text: 'Cancelled',
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-red-500',
          description: 'This order was cancelled'
        };
      default:
        return {
          text: order.status,
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-gray-500',
          description: 'Order status update'
        };
    }
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingSpinner />;

  const currentOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Your Orders</h3>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            History ({completedOrders.length})
          </button>
        </div>
      </div>

      {currentOrders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {activeTab === 'active' 
                ? 'No active orders at the moment.' 
                : 'No completed orders yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        currentOrders.map(order => {
        const statusDisplay = getStatusDisplay(order);
        return (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Order #{order.id?.slice(-6)}</CardTitle>
                <Badge variant="secondary">
                  ${order.totalPrice.toFixed(2)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed at {formatTime(order.createdAt)}
              </p>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Status Display */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                <div className={`p-2 rounded-full ${statusDisplay.color} text-white`}>
                  {statusDisplay.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{statusDisplay.text}</p>
                  <p className="text-sm text-muted-foreground">{statusDisplay.description}</p>
                </div>
              </div>

              {/* Driver Info (when assigned) */}
              {order.driverId && order.driverName && (
                <div className="flex items-center gap-3 mb-4 p-3 border rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Your Driver</p>
                    <p className="text-sm text-muted-foreground">{order.driverName}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full cursor-pointer hover:bg-green-200">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2">
                <p className="font-medium text-sm">Order Items:</p>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Delivering to: {order.customerAddress}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }))}
    </div>
  );
};