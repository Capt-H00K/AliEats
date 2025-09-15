import React, { useState, useEffect } from 'react';
import { OrderCard } from '@/components/orders/OrderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Order } from '@/types';
import { updateOrder, subscribeToOrders } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { Clock, Utensils, CheckCircle, TrendingUp } from 'lucide-react';

export const RestaurantDashboard: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready' | 'completed'>('pending');

  useEffect(() => {
    const unsubscribe = subscribeToOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updates: any = { status };
      
      // When accepting, move to preparing
      if (status === 'accepted') {
        updates.status = 'preparing';
      }
      
      await updateOrder(orderId, updates);
      toast({
        title: "Status updated",
        description: `Order status has been updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  // Filter orders by status
  const getFilteredOrders = (status: string) => {
    switch (status) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'preparing':
        return orders.filter(order => order.status === 'accepted' || order.status === 'preparing');
      case 'ready':
        return orders.filter(order => order.status === 'ready' || order.status === 'picked_up');
      case 'completed':
        return orders.filter(order => order.status === 'delivered');
      default:
        return [];
    }
  };

  // Calculate stats
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const preparingOrders = orders.filter(order => order.status === 'accepted' || order.status === 'preparing').length;
  const readyOrders = orders.filter(order => order.status === 'ready').length;
  const todayRevenue = orders
    .filter(order => 
      new Date(order.createdAt).toDateString() === new Date().toDateString() &&
      (order.status === 'delivered' || order.status === 'picked_up' || order.status === 'ready')
    )
    .reduce((sum, order) => sum + order.totalPrice, 0);

  const tabs = [
    { id: 'pending', label: `Pending Orders (${pendingOrders})` },
    { id: 'preparing', label: `Preparing (${preparingOrders})` },
    { id: 'ready', label: `Ready (${readyOrders})` },
    { id: 'completed', label: 'Completed' },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Restaurant Dashboard</h2>
        <p className="text-muted-foreground">Manage all orders and update their status</p>
      </div>

      {/* Restaurant Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-pending">
                  {pendingOrders}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Clock className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">In Progress</p>
                <p className="text-2xl font-bold text-secondary" data-testid="stat-preparing">
                  {preparingOrders}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Utensils className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Ready</p>
                <p className="text-2xl font-bold text-accent" data-testid="stat-ready">
                  {readyOrders}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <CheckCircle className="text-accent h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Today's Revenue</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-revenue">
                  ${todayRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Management Tabs */}
      <Card>
        <div className="border-b border-border">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex-1 px-6 py-4 rounded-none ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary hover:text-secondary-foreground'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
                data-testid={`button-tab-${tab.id}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {getFilteredOrders(activeTab).length > 0 ? (
              getFilteredOrders(activeTab).map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole="restaurant"
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8" data-testid={`text-no-${activeTab}-orders`}>
                No {activeTab} orders at the moment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
