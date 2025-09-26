import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrderCard } from '@/components/orders/OrderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Order } from '@/types';
import { subscribeToOrders, updateOrder } from '@/services/realtime';
import { driverAcceptOrderRealtime } from '@/services/realtimeOrders';
import { useToast } from '@/hooks/use-toast';
import { Package, DollarSign, Star, CheckCircle, Receipt } from 'lucide-react';
import { DriverLedger } from '@/components/driver/DriverLedger';

export const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'ledger'>('orders');

  useEffect(() => {
    // Defensive checks for user, role, and id
    if (!user) {
      console.warn("No user in context for DriverDashboard");
      setLoading(false);
      return;
    }
    if (user.role !== "driver") {
      console.warn("User is not a driver, role:", user.role);
      setLoading(false);
      return;
    }
    if (!user.id) {
      console.warn("Driver user has no id!", user);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToOrders(
        (fetchedOrders) => {
          // Show all unassigned pending orders, plus those assigned to this driver
          const driverOrders = fetchedOrders.filter(order =>
            (order?.status === "pending" && !order?.driverId) || order?.driverId === user.id
          );
          setOrders(driverOrders);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe to driver orders",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [user, toast]);

  const handleAcceptOrder = async (order: Order) => {
    if (!user?.id) return;
    try {
      await driverAcceptOrderRealtime({
        orderId: order.id || "",
        driverId: user.id,
        driverName: user.name,
        restaurantId: order.restaurantId,
        orderAmount: order.totalPrice,
      });
      toast({
        title: "Order accepted",
        description: `You've accepted order #${order.id}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrder(orderId, { status });
      toast({
        title: "Status updated",
        description: `Order status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    try {
      await updateOrder(orderId, { 
        paymentConfirmed: true,
        status: 'delivered'
      });
      toast({
        title: "Payment confirmed",
        description: "Payment confirmed and order marked as delivered",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm payment.",
        variant: "destructive",
      });
    }
  };

  // Calculate stats safely
  const todayOrders = orders.filter(order =>
    new Date(order.createdAt || '').toDateString() === new Date().toDateString()
  );
  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalEarnings = completedOrders.reduce(
    (sum, order) => sum + (order.totalPrice || 0) * 0.15,
    0
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Driver Dashboard</h2>
        <p className="text-muted-foreground">Manage your deliveries and confirm payments</p>
      </div>

      {/* Driver Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Today's Orders</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-today-orders">
                  {todayOrders.length}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Package className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Completed Orders</p>
                <p className="text-2xl font-bold text-secondary" data-testid="stat-completed-orders">
                  {completedOrders.length}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <CheckCircle className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-accent" data-testid="stat-total-earnings">
                  ${totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <DollarSign className="text-accent h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Rating</p>
                <p className="text-2xl font-bold text-primary" data-testid="stat-rating">
                  4.8
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Star className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card className="mb-8">
        <div className="border-b border-border">
          <div className="flex space-x-0">
            <Button
              variant={activeTab === 'orders' ? "default" : "ghost"}
              className={`flex-1 px-6 py-4 rounded-none ${
                activeTab === 'orders'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary hover:text-secondary-foreground'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              <Package className="mr-2 h-4 w-4" />
              Available & Assigned Orders
            </Button>
            <Button
              variant={activeTab === 'ledger' ? "default" : "ghost"}
              className={`flex-1 px-6 py-4 rounded-none ${
                activeTab === 'ledger'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary hover:text-secondary-foreground'
              }`}
              onClick={() => setActiveTab('ledger')}
            >
              <Receipt className="mr-2 h-4 w-4" />
              My Ledger
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          {activeTab === 'orders' ? (
            <>
              <h3 className="text-xl font-semibold mb-6" data-testid="text-orders-title">
                Available & Assigned Orders
              </h3>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      userRole="driver"
                      onAcceptOrder={() => handleAcceptOrder(order)}
                      onUpdateStatus={handleUpdateOrderStatus}
                      onConfirmPayment={handleConfirmPayment}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8" data-testid="text-no-orders">
                  No orders available at the moment.
                </p>
              )}
            </>
          ) : (
            <DriverLedger />
          )}
        </CardContent>
      </Card>
    </div>
  );
};