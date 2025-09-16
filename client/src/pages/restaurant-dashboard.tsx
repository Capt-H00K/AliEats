// src/pages/restaurant-dashboard.tsx
import React, { useState, useEffect } from 'react';
import { OrderCard } from '@/components/orders/OrderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Order, MenuItem, OrderStatus } from '@/types';
import {
  subscribeToOrders,
  subscribeToMenuItems,
  updateOrder,
  deleteMenuItem
} from '@/services/realtime';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Utensils, CheckCircle, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { MenuForm } from '@/components/menu/MenuForm';
import { Modal } from '@/components/ui/Modal';

export const RestaurantDashboard: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready' | 'completed'>('pending');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Subscribe to orders & menu items in Realtime Database
  useEffect(() => {
    if (!user) return;

    const unsubscribeOrders = subscribeToOrders(
      (fetchedOrders) => {
        setOrders(fetchedOrders);
        setLoading(false);
      },
      { restaurantId: user.id }
    );

    const unsubscribeMenu = subscribeToMenuItems(user.id, (fetchedMenuItems) => {
      setMenuItems(fetchedMenuItems);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeMenu();
    };
  }, [user]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      let newStatus: OrderStatus;

      // move to next logical status
      switch (status) {
        case 'pending':
          newStatus = 'preparing';
          break;
        case 'preparing':
          newStatus = 'ready';
          break;
        case 'ready':
          newStatus = 'picked_up'; // or 'delivered' depending on your workflow
          break;
        default:
          newStatus = status;
      }

      await updateOrder(orderId, { status: newStatus });
      toast({ title: 'Status updated', description: 'Order status has been updated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' });
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      if (!user) return;
      await deleteMenuItem(user.id, id);
      toast({ title: 'Deleted', description: 'Menu item has been deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete menu item', variant: 'destructive' });
    }
  };

  const getFilteredOrders = (status: 'pending' | 'preparing' | 'ready' | 'completed') => {
    switch (status) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'preparing':
        return orders.filter(order => order.status === 'preparing');
      case 'ready':
        return orders.filter(order => order.status === 'ready' || order.status === 'picked_up');
      case 'completed':
        return orders.filter(order => order.status === 'completed');
      default:
        return [];
    }
  };

  // Stats
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const preparingOrders = orders.filter(order => order.status === 'preparing').length;
  const readyOrders = orders.filter(order => order.status === 'ready' || order.status === 'picked_up').length;
  const todayRevenue = orders
    .filter(order => new Date(order.createdAt ?? new Date()).toDateString() === new Date().toDateString() &&
      ['delivered', 'picked_up', 'ready'].includes(order.status))
    .reduce((sum, order) => sum + order.totalPrice, 0);

  const tabs = [
    { id: 'pending', label: `Pending Orders (${pendingOrders})` },
    { id: 'preparing', label: `Preparing (${preparingOrders})` },
    { id: 'ready', label: `Ready (${readyOrders})` },
    { id: 'completed', label: 'Completed' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Restaurant Dashboard</h2>
          <p className="text-muted-foreground">Manage all orders and update their status</p>
        </div>
        <Button
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => { setEditingItem(null); setIsMenuModalOpen(true); }}
        >
          <Plus size={16} /> Add Menu Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-primary">{pendingOrders}</p>
            </div>
            <Clock className="text-primary h-6 w-6 bg-primary/10 p-2 rounded-lg" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">In Progress</p>
              <p className="text-2xl font-bold text-secondary">{preparingOrders}</p>
            </div>
            <Utensils className="text-secondary h-6 w-6 bg-secondary/10 p-2 rounded-lg" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Ready</p>
              <p className="text-2xl font-bold text-accent">{readyOrders}</p>
            </div>
            <CheckCircle className="text-accent h-6 w-6 bg-accent/10 p-2 rounded-lg" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Today's Revenue</p>
              <p className="text-2xl font-bold text-primary">${todayRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-primary h-6 w-6 bg-primary/10 p-2 rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Card className="mb-8">
        <div className="border-b border-border">
          <div className="flex space-x-0">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex-1 px-6 py-4 rounded-none ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary hover:text-secondary-foreground'
                }`}
                onClick={() => setActiveTab(tab.id as 'pending' | 'preparing' | 'ready' | 'completed')}
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
              <p className="text-muted-foreground text-center py-8">
                No {activeTab} orders at the moment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Menu Items</h3>
          {menuItems.length === 0 ? (
            <p className="text-muted-foreground">No menu items added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <Card key={item.id} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => { setEditingItem(item); setIsMenuModalOpen(true); }}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteMenuItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu Modal */}
      <Modal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
      >
        <MenuForm
          item={editingItem || undefined}
          onClose={() => setIsMenuModalOpen(false)}
          onSave={() => setIsMenuModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
