import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Restaurant, MenuItem, CartItem } from '@/types';
import { getRestaurants, getMenuItems } from '@/services/realtime';
import { RestaurantList } from '@/components/customers/RestaurantList';
import { MenuList } from '@/components/customers/MenuList';
import { Cart } from '@/components/customers/Cart';
import { OrderTracking } from '@/components/customers/OrderTracking';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'browse' | 'orders'>('browse');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await getRestaurants();
        const safeData = data.map(r => ({
          ...r,
          name: r.name || "Unnamed Restaurant",
          description: r.description || "",
          image: r.image || "/placeholder.png",
        }));
        setRestaurants(safeData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load restaurants",
          variant: "destructive",
        });
      } finally {
        setLoadingRestaurants(false);
      }
    };
    loadRestaurants();
  }, [toast]);

  // When selecting a restaurant, also fetch its menu
  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setLoadingMenu(true);
    try {
      const items = await getMenuItems(restaurant.id);
      setMenuItems(items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setLoadingMenu(false);
    }
  };

  if (loadingRestaurants) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-muted-foreground">Hungry? Let's find you something delicious</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'browse' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('browse')}
          className="px-6"
        >
          Browse Restaurants
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('orders')}
          className="px-6"
        >
          Track Orders
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' ? (
        !selectedRestaurant ? (
          <RestaurantList
            restaurants={restaurants}
            onSelect={handleSelectRestaurant}
          />
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedRestaurant(null);
                setMenuItems([]);
              }}
              className="mb-4"
            >
              Back to Restaurants
            </Button>

            {loadingMenu ? (
              <LoadingSpinner />
            ) : (
              <>
                <MenuList
                  restaurant={selectedRestaurant}
                  menuItems={menuItems}
                  setMenuItems={setMenuItems}
                  cart={cart}
                  setCart={setCart}
                />

                <Cart
                  cart={cart}
                  setCart={setCart}
                  selectedRestaurant={selectedRestaurant}
                  onOrderPlaced={() => setActiveTab('orders')}
                />
              </>
            )}
          </>
        )
      ) : (
        <OrderTracking />
      )}
    </div>
  );
};
