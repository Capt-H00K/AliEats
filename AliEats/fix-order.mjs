import { initializeApp } from 'firebase/app';
import { getDatabase, ref, update } from 'firebase/database';

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

async function fixOrder() {
  try {
    console.log('Fixing order restaurantId...');
    
    // Update the order with the correct restaurant ID
    const orderRef = ref(database, 'orders/-O_mw2zwn9nysah91Jyt');
    await update(orderRef, {
      restaurantId: 'wbw3CQy3RFMdKvYmueC2pDoZu4K3' // Pizza Palace Owner ID
    });
    
    console.log('Order updated successfully!');
    console.log('Order -O_mw2zwn9nysah91Jyt now has restaurantId: wbw3CQy3RFMdKvYmueC2pDoZu4K3');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

fixOrder();