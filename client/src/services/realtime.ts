// src/services/realtime.ts
import { ref, get, push, set, update, remove, onValue } from "firebase/database";
import { database } from "@/lib/firebase"; // ✅ make sure lib/firebase.ts exports "database"
import { MenuItem, Order, Restaurant } from "@/types";

// ============================
// RESTAURANTS
// ============================
export const getRestaurants = async (): Promise<Restaurant[]> => {
  const snapshot = await get(ref(database, "restaurants"));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, value]) => {
    const val = value as Omit<Restaurant, "id">;
    // Ensure all necessary fields exist
    return {
      id,
      name: val.name ?? "Unnamed Restaurant",
      description: val.description ?? "",
      image: val.image ?? "",
      createdAt: val.createdAt ? new Date(val.createdAt) : undefined,
      updatedAt: val.updatedAt ? new Date(val.updatedAt) : undefined,
    };
  });
};

// Add new restaurant (for sign-up flow)
export const addRestaurant = async (restaurant: Omit<Restaurant, "id">) => {
  const restaurantsRef = ref(database, "restaurants");
  const newRef = push(restaurantsRef);
  await set(newRef, restaurant);
  return { id: newRef.key!, ...restaurant };
};

// ============================
// MENU ITEMS (per restaurant)
// ============================
export const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  const snapshot = await get(ref(database, `restaurants/${restaurantId}/menu`));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, value]) => ({
    id,
    ...(value as Omit<MenuItem, "id">),
  }));
};

export const addMenuItem = async (
  restaurantId: string,
  item: Omit<MenuItem, "id">
) => {
  const menuRef = ref(database, `restaurants/${restaurantId}/menu`);
  const newRef = push(menuRef);
  await set(newRef, item);
  return { id: newRef.key!, ...item };
};

export const updateMenuItem = async (
  restaurantId: string,
  itemId: string,
  updates: Partial<MenuItem>
) => {
  const itemRef = ref(database, `restaurants/${restaurantId}/menu/${itemId}`);
  await update(itemRef, updates);
};

export const deleteMenuItem = async (restaurantId: string, itemId: string) => {
  const itemRef = ref(database, `restaurants/${restaurantId}/menu/${itemId}`);
  await remove(itemRef);
};

export const subscribeToMenuItems = (
  restaurantId: string,
  callback: (items: MenuItem[]) => void
) => {
  const menuRef = ref(database, `restaurants/${restaurantId}/menu`);
  return onValue(menuRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const items = Object.entries(data).map(([id, value]) => ({
      id,
      ...(value as Omit<MenuItem, "id">),
    }));
    callback(items);
  });
};

// ============================
// ORDERS
// ============================
export const createOrder = async (
  order: Omit<Order, "id" | "createdAt" | "updatedAt">
) => {
  const ordersRef = ref(database, "orders");
  const newOrderRef = push(ordersRef);
  const orderData = {
    ...order,
    id: newOrderRef.key,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await set(newOrderRef, orderData);
  return orderData;
};

export const updateOrder = async (
  orderId: string,
  updates: Partial<Order>
) => {
  const orderRef = ref(database, `orders/${orderId}`);
  await update(orderRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  filters?: { customerId?: string; driverId?: string; restaurantId?: string }
) => {
  const ordersRef = ref(database, "orders");
  return onValue(ordersRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    let orders: Order[] = Object.entries(data).map(([id, value]) => {
      const val = value as any;
      return {
        id,
        ...val,
        createdAt: val.createdAt ? new Date(val.createdAt) : new Date(),
        updatedAt: val.updatedAt ? new Date(val.updatedAt) : new Date(),
      } as Order;
    });

    // Apply filters
    if (filters?.customerId) {
      orders = orders.filter((o) => o.customerId === filters.customerId);
    }
    if (filters?.driverId) {
      orders = orders.filter((o) => o.driverId === filters.driverId);
    }
    if (filters?.restaurantId) {
      orders = orders.filter((o) => o.restaurantId === filters.restaurantId);
    }

    // Sort by createdAt (safely)
    orders.sort(
      (a, b) =>
        (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0)
    );

    callback(orders);
  });
};
