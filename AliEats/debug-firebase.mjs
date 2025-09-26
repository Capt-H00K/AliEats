import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD7NedynjEGpfMevRcG81n2gv1tLvT1g-k",
  authDomain: "flavorfleet-a9b09.firebaseapp.com",
  databaseURL: "https://flavorfleet-a9b09-default-rtdb.firebaseio.com",
  projectId: "flavorfleet-a9b09",
  storageBucket: "flavorfleet-a9b09.firebasestorage.app",
  messagingSenderId: "38387869918",
  appId: "1:38387869918:web:12f100d594eb8120673a4f",
  measurementId: "G-ERNMEW6E0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function debugFirebaseData() {
  try {
    console.log('Checking Firebase orders...');
    
    // Get all orders
    const ordersRef = ref(database, 'orders');
    const ordersSnapshot = await get(ordersRef);
    
    if (ordersSnapshot.exists()) {
      const orders = ordersSnapshot.val();
      console.log('\n=== ALL ORDERS ===');
      Object.entries(orders).forEach(([id, order]) => {
        console.log(`Order ${id}:`, {
          restaurantId: order.restaurantId,
          customerId: order.customerId,
          status: order.status,
          driverId: order.driverId || 'none',
          driverName: order.driverName || 'none',
          totalPrice: order.totalPrice,
          createdAt: order.createdAt
        });
      });
    } else {
      console.log('No orders found in database');
    }
    
    // Get all users to see restaurant IDs
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();
      console.log('\n=== ALL USERS ===');
      Object.entries(users).forEach(([id, user]) => {
        console.log(`User ${id}:`, {
          name: user.name,
          email: user.email,
          role: user.role
        });
      });
    } else {
      console.log('No users found in database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

debugFirebaseData();