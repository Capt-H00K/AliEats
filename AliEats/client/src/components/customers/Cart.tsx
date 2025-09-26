import React, { useState } from 'react';
import { CartItem, Restaurant } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { PaymentSelector } from './PaymentSelector';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/services/realtime';
import { useToast } from '@/hooks/use-toast';

interface CartProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedRestaurant: Restaurant;
  onOrderPlaced?: () => void;
}

export const Cart: React.FC<CartProps> = ({ cart, setCart, selectedRestaurant, onOrderPlaced }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('bank');
  const [placing, setPlacing] = useState(false);

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.menuItem.id !== menuItemId));
    } else {
      setCart(prev => prev.map(item => item.menuItem.id === menuItemId ? { ...item, quantity } : item));
    }
  };

  const getTotalPrice = () => cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);

  const placeOrderHandler = async () => {
    if (!user) return toast({ title: "Error", description: "User not logged in", variant: "destructive" });
    if (cart.length === 0) return toast({ title: "Error", description: "Cart is empty", variant: "destructive" });

    setPlacing(true);
    try {
      const order = {
        customerId: user.id,
        customerName: user.name,
        customerAddress: user.address || "123 Main St",
        restaurantId: selectedRestaurant.id,
        items: cart,
        totalPrice: getTotalPrice(),
        status: 'pending' as const,
        paymentMethod,
        paymentConfirmed: paymentMethod === 'bank',
      };

      await createOrder(order);
      setCart([]);
      toast({ title: "Order placed!", description: "Your order has been sent." });
      onOrderPlaced?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to place order.", variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          Your Order ({cart.length} {cart.length === 1 ? 'item' : 'items'})
        </h3>

        {cart.length > 0 ? (
          <>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.menuItem.id} className="flex justify-between items-center py-2 border-b border-border">
                  <div className="flex items-center flex-1">
                    <span className="font-medium">{item.menuItem.name}</span>
                    <div className="ml-4 flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}>-</Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}>+</Button>
                    </div>
                  </div>
                  <span className="font-semibold">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-lg font-bold mb-4">
              <span>Total</span>
              <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
            </div>

            <PaymentSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

            <Button onClick={placeOrderHandler} disabled={placing} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <ShoppingCart className="mr-2 h-4 w-4" />
              {placing ? 'Placing Order...' : 'Place Order'}
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-4">Your cart is empty. Add some delicious items!</p>
        )}
      </CardContent>
    </Card>
  );
};
