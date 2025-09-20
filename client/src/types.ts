// types.ts

// ========== RESTAURANT ==========
export interface Restaurant {
  id: string;            // Firestore document ID
  name: string;
  description: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========== MENU ITEM ==========
export interface MenuItem {
  id: string;            // Firestore document ID
  restaurantId: string;  // reference to parent restaurant
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available?: boolean;   // for quick toggle availability
  createdAt?: Date;
  updatedAt?: Date;
}

// ========== CART ==========
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

// ========== PAYMENT ==========
export type PaymentMethod = 'cash' | 'bank';

// ========== ORDER ==========
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'completed' | 'cancelled';

export interface Order {
  id?: string; // Firestore auto ID
  customerId: string;
  customerName: string;
  customerAddress: string;
  restaurantId: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;   // updated
  paymentMethod: PaymentMethod;
  paymentConfirmed: boolean;
  driverId?: string;
  driverName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========== USER ==========
export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: 'customer' | 'driver' | 'restaurant';
  phone?: string;
  address?: string; // for customers
  createdAt?: Date;
  updatedAt?: Date;
}

// ========== AUTH CONTEXT ==========
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: 'customer' | 'driver' | 'restaurant'
  ) => Promise<void>;
  signOut: () => Promise<void>;
}
