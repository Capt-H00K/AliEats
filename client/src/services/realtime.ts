import { ref, get, push, set, update, remove, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
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

export const addRestaurant = async (
  restaurant: Omit<Restaurant, "id">,
  uid: string
) => {
  const restaurantRef = ref(database, `restaurants/${uid}`);
  await set(restaurantRef, {
    ...restaurant,
    createdAt: restaurant.createdAt.toISOString(),
    updatedAt: restaurant.updatedAt.toISOString(),
  });
  return { id: uid, ...restaurant };
};

// ============================
// MENU ITEMS (per restaurant)
// ============================
export const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  const snapshot = await get(ref(database, `restaurants/${restaurantId}/menu`));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();

  return Object.entries(data).map(([id, value]) => {
    const item = value as Partial<MenuItem>;
    return {
      id,
      restaurantId: item.restaurantId ?? restaurantId,
      name: item.name ?? "Unnamed Item",
      description: item.description ?? "",
      price: item.price ?? 0,
      image: item.image ?? "",
      category: item.category ?? "Uncategorized",
      available: item.available !== false,
    };
  });
};

export const addMenuItem = async (
  restaurantId: string,
  item: Omit<MenuItem, "id" | "restaurantId">
) => {
  const menuRef = ref(database, `restaurants/${restaurantId}/menu`);
  const newRef = push(menuRef);
  const itemWithRestaurantId = {
    ...item,
    restaurantId,
  };
  await set(newRef, itemWithRestaurantId);
  return { id: newRef.key!, ...itemWithRestaurantId };
};

export const updateMenuItem = async (
  restaurantId: string,
  itemId: string,
  updates: Partial<Omit<MenuItem, "id" | "restaurantId">>
) => {
  const itemRef = ref(database, `restaurants/${restaurantId}/menu/${itemId}`);
  const updatesWithRestaurantId = {
    ...updates,
    restaurantId,
  };
  await update(itemRef, updatesWithRestaurantId);
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
    const items = Object.entries(data).map(([id, value]) => {
      const item = value as Partial<MenuItem>;
      return {
        id,
        restaurantId: item.restaurantId ?? restaurantId,
        name: item.name ?? "Unnamed Item",
        description: item.description ?? "",
        price: item.price ?? 0,
        image: item.image ?? "",
        category: item.category ?? "Uncategorized",
        available: item.available !== false,
      };
    });
    callback(items);
  });
};

// ============================
// ORDERS
// ============================
export const createOrder = async (
  order: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<Order> => {
  const ordersRef = ref(database, "orders");
  const newOrderRef = push(ordersRef);
  const now = new Date();

  const orderData: Order = {
    ...order,
    id: newOrderRef.key!,
    createdAt: now,
    updatedAt: now,
  };

  // Save with ISO strings in Firebase
  await set(newOrderRef, {
    ...orderData,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  return orderData;
};

export const updateOrder = async (
  orderId: string,
  updates: Partial<Order>
) => {
  const orderRef = ref(database, `orders/${orderId}`);
  const now = new Date();

  const serializedUpdates: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value instanceof Date) {
      serializedUpdates[key] = value.toISOString();
    } else {
      serializedUpdates[key] = value;
    }
  }

  await update(orderRef, {
    ...serializedUpdates,
    updatedAt: now.toISOString(),
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

    // Sort newest first
    orders.sort(
      (a, b) =>
        (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0)
    );

    callback(orders);
  });
};
