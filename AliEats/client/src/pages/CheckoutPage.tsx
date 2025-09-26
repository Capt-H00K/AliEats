import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createOrderRealtime } from "@/services/realtimeOrders";

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurantId, setRestaurantId] = useState(""); // Replace with your actual restaurant selection logic
  const [totalPrice, setTotalPrice] = useState<number>(0); // Replace with your cart total logic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo, you can set restaurantId/totalPrice manually, or wire up to your state/cart
  const handlePlaceOrder = async () => {
    if (!user || !restaurantId || !totalPrice) {
      setError("Please log in, select a restaurant, and add items to your cart.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const orderId = await createOrderRealtime({
        customerId: user.id,
        restaurantId,
        totalPrice,
      });
      // Optionally: Redirect to order confirmation or orders page
      navigate(`/order-confirmation/${orderId}`);
    } catch (e) {
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      {/* Replace these with your cart/restaurant UI */}
      <div className="mb-4">
        <label>Restaurant ID:</label>
        <input
          className="border p-2 w-full"
          value={restaurantId}
          onChange={e => setRestaurantId(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label>Total Price:</label>
        <input
          className="border p-2 w-full"
          type="number"
          value={totalPrice}
          onChange={e => setTotalPrice(parseFloat(e.target.value))}
        />
      </div>
      <button
        className="bg-primary text-white px-4 py-2 rounded"
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default CheckoutPage;