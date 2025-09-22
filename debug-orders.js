// Debug script to check Firebase orders
import { database } from './client/src/lib/firebase.js';
import { ref, get } from 'firebase/database';

async function debugOrders() {
  try {
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    
    if (snapshot.exists()) {
      const orders = snapshot.val();
      console.log('All orders in database:');
      Object.entries(orders).forEach(([id, order]) => {
        console.log(`Order ${id}:`, {
          restaurantId: order.restaurantId,
          status: order.status,
          driverId: order.driverId,
          driverName: order.driverName,
          totalPrice: order.totalPrice,
          customerId: order.customerId
        });
      });
    } else {
      console.log('No orders found in database');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

debugOrders();