export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'driver';
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  driverId?: string;
  driverName?: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'rejected';
  paymentMethod: 'cash' | 'bank';
  paymentConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'customer' | 'driver') => Promise<void>;
  signOut: () => Promise<void>;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
}
