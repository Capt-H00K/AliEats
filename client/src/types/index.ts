// src/types/index.ts

// ========== RESTAURANT ==========
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========== MENU ITEM ==========
export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

// ========== CART ==========
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

// ========== PAYMENT ==========
export type PaymentMethod = "cash" | "bank";

// ========== ORDER ==========
export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "picked_up"
  | "delivered"
  | "rejected"
  | "completed"
  | "cancelled";

export interface Order {
  id: string; // required (Firebase push key)
  customerId: string;
  customerName: string;
  customerAddress: string;
  restaurantId: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentConfirmed: boolean;
  driverId?: string;
  driverName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========== USER ==========
export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "driver" | "restaurant";
  phone?: string;
  address?: string;
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
    role: "customer" | "driver" | "restaurant"
  ) => Promise<void>;
  signOut: () => Promise<void>;
}
