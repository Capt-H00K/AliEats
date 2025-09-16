// src/pages/customer-dashboard.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MenuCard } from '@/components/menu/MenuCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MenuItem, CartItem, Restaurant } from '@/types';
import { getMenuItems, getRestaurants, createOrder } from '@/services/realtime';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('bank');
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [placing, setPlacing] = useState(false);

  const categories = ['All', 'Pizza', 'Burgers', 'Salads', 'Pasta', 'Mexican', 'Vegetarian'];

  // Load restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await getRestaurants();
        // Ensure each restaurant has a name, description, image
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

  // Select a restaurant
  const handleSelectRestaurant = async (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId) || null;
    setSelectedRestaurant(restaurant);
    if (!restaurant) return;

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

  // Filter menu items
  useEffect(() => {
    let filtered = menuItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]);

  // Cart operations
  const addToCart = (menuItem: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { menuItem, quantity: 1 }];
      }
    });

    toast({
      title: "Added to cart",
      description: `${menuItem.name} has been added to your cart`,
    });
  };

  const updateCartItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.menuItem.id !== menuItemId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!user || !selectedRestaurant || cart.length === 0) return;

    setPlacing(true);
    try {
      const order = {
        customerId: user.id,
        customerName: user.name,
        customerAddress: "123 Main St, City, State",
        restaurantId: selectedRestaurant.id,
        items: cart,
        totalPrice: getTotalPrice(),
        status: 'pending' as const,
        paymentMethod,
        paymentConfirmed: paymentMethod === 'bank',
      };

      await createOrder(order);
      setCart([]);
      toast({
        title: "Order placed successfully!",
        description: "Your order has been sent to the restaurant",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  if (loadingRestaurants) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-muted-foreground">Hungry? Let's find you something delicious</p>
      </div>

      {!selectedRestaurant ? (
        restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {restaurants.map(r => (
              <RestaurantCard
                key={r.id}
                restaurant={{
                  ...r,
                  name: r.name || "Unnamed Restaurant",
                  description: r.description || "",
                  image: r.image || "/placeholder.png",
                }}
                onSelect={handleSelectRestaurant}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No restaurants available at the moment.
          </div>
        )
      ) : (
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedRestaurant(null);
              setMenuItems([]);
              setCart([]);
            }}
            className="mb-4"
          >
            Back to Restaurants
          </Button>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingMenu ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <MenuCard key={item.id} item={item} onAddToCart={addToCart} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">
                    No items found matching your search criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Your Order ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </h3>

              {cart.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.map(item => (
                      <div
                        key={item.menuItem.id}
                        className="flex justify-between items-center py-2 border-b border-border"
                      >
                        <div className="flex items-center flex-1">
                          <span className="font-medium">{item.menuItem.name}</span>
                          <div className="ml-4 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCartItemQuantity(item.menuItem.id, item.quantity - 1)
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCartItemQuantity(item.menuItem.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <span className="font-semibold">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold mb-4">
                    <span>Total</span>
                    <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`px-4 py-3 rounded-lg border-2 text-center transition-colors ${
                        paymentMethod === 'cash'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-transparent bg-muted text-muted-foreground hover:border-primary'
                      }`}
                    >
                      <DollarSign className="mx-auto mb-2 h-5 w-5" />
                      <span className="text-sm font-medium">Cash on Delivery</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`px-4 py-3 rounded-lg border-2 text-center transition-colors ${
                        paymentMethod === 'bank'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-transparent bg-muted text-muted-foreground hover:border-primary'
                      }`}
                    >
                      <CreditCard className="mx-auto mb-2 h-5 w-5" />
                      <span className="text-sm font-medium">Bank Transfer</span>
                    </button>
                  </div>

                  <Button
                    onClick={placeOrder}
                    disabled={placing}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Your cart is empty. Add some delicious items!
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
