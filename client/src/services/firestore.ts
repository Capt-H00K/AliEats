import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MenuItem, Order, CartItem } from '@/types';

// Menu Items
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const menuCollection = collection(db, 'menu');
  const menuSnapshot = await getDocs(query(menuCollection, where('available', '==', true)));
  
  return menuSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as MenuItem));
};

// Orders
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const ordersCollection = collection(db, 'orders');
  const orderData = {
    ...order,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  return await addDoc(ordersCollection, orderData);
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
  const orderRef = doc(db, 'orders', orderId);
  return await updateDoc(orderRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  const ordersCollection = collection(db, 'orders');
  const ordersQuery = query(
    ordersCollection,
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  
  const ordersSnapshot = await getDocs(ordersQuery);
  return ordersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  } as Order));
};

export const getDriverOrders = async (driverId: string): Promise<Order[]> => {
  const ordersCollection = collection(db, 'orders');
  const ordersQuery = query(
    ordersCollection,
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc')
  );
  
  const ordersSnapshot = await getDocs(ordersQuery);
  return ordersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  } as Order));
};

export const getAllOrders = async (): Promise<Order[]> => {
  const ordersCollection = collection(db, 'orders');
  const ordersQuery = query(ordersCollection, orderBy('createdAt', 'desc'));
  
  const ordersSnapshot = await getDocs(ordersQuery);
  return ordersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  } as Order));
};

export const subscribeToOrders = (callback: (orders: Order[]) => void, filters?: any) => {
  const ordersCollection = collection(db, 'orders');
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
  }
  
  return onSnapshot(ordersQuery, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Order));
    callback(orders);
  });
};

// Seed menu data
export const seedMenuData = async () => {
  const menuItems: Omit<MenuItem, 'id'>[] = [
    {
      name: "Margherita Pizza",
      description: "Fresh mozzarella, tomato sauce, and basil on crispy dough",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      category: "Pizza",
      available: true
    },
    {
      name: "Classic Burger",
      description: "Juicy beef patty with lettuce, tomato, onion, and our special sauce",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      category: "Burgers",
      available: true
    },
    {
      name: "Caesar Salad",
      description: "Fresh romaine lettuce, parmesan cheese, croutons, and caesar dressing",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      category: "Salads",
      available: true
    },
    {
      name: "Chicken Alfredo Pasta",
      description: "Grilled chicken breast with fettuccine in creamy alfredo sauce",
      price: 16.99,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      category: "Pasta",
      available: true
    },
    {
      name: "Fish Tacos",
      description: "Fresh fish with cabbage slaw, pico de gallo, and lime crema",
      price: 13.99,
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      category: "Mexican",
      available: true
    },
    {
      name: "Vegetable Stir Fry",
      description: "Mixed vegetables stir-fried with tofu served over jasmine rice",
      price: 11.99,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      category: "Vegetarian",
      available: true
    }
  ];

  const menuCollection = collection(db, 'menu');
  
  for (const item of menuItems) {
    await addDoc(menuCollection, item);
  }
};
