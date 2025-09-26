import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { database } from '@/lib/firebase';
import { MenuItem, Order, Restaurant } from '@/types';

// ============================
// MENU ITEMS (per restaurant)
// ============================

export const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  const menuCollection = collection(database, 'restaurants', restaurantId, 'menu');
  const menuSnapshot = await getDocs(menuCollection);

  return menuSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as MenuItem));
};

export const addMenuItem = async (restaurantId: string, item: Omit<MenuItem, 'id'>) => {
  const menuCollection = collection(database, 'restaurants', restaurantId, 'menu');
  return await addDoc(menuCollection, item);
};

export const updateMenuItem = async (restaurantId: string, itemId: string, updates: Partial<MenuItem>) => {
  const menuRef = doc(database, 'restaurants', restaurantId, 'menu', itemId);
  return await updateDoc(menuRef, updates);
};

export const deleteMenuItem = async (restaurantId: string, itemId: string) => {
  const menuRef = doc(database, 'restaurants', restaurantId, 'menu', itemId);
  return await deleteDoc(menuRef);
};

export const subscribeToMenuItems = (
  restaurantId: string,
  callback: (items: MenuItem[]) => void
) => {
  const menuCollection = collection(database, 'restaurants', restaurantId, 'menu');
  return onSnapshot(menuCollection, snapshot => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));
    callback(items);
  });
};

// ============================
// ORDERS
// ============================

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const ordersCollection = collection(database, 'orders');
  const orderData = {
    ...order,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  return await addDoc(ordersCollection, orderData);
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
  const orderRef = doc(database, 'orders', orderId);
  return await updateDoc(orderRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  filters?: { customerId?: string; driverId?: string; restaurantId?: string }
) => {
  const ordersCollection = collection(database, 'orders');
  let ordersQuery = query(ordersCollection, orderBy('createdAt', 'desc'));

  if (filters?.customerId) {
    ordersQuery = query(
      ordersCollection,
      where('customerId', '==', filters.customerId),
      orderBy('createdAt', 'desc')
    );
  } else if (filters?.driverId) {
    ordersQuery = query(
      ordersCollection,
      where('driverId', '==', filters.driverId),
      orderBy('createdAt', 'desc')
    );
  } else if (filters?.restaurantId) {
    ordersQuery = query(
      ordersCollection,
      where('restaurantId', '==', filters.restaurantId),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(ordersQuery, snapshot => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Order));
    callback(orders);
  });
};

// ============================
// RESTAURANTS
// ============================

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const restaurantsCollection = collection(database, 'restaurants');
  const snapshot = await getDocs(restaurantsCollection);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Restaurant));
};
