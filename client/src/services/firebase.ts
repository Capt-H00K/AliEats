import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual API key
  authDomain: "flavorfleet-a9b09.firebaseapp.com",
  projectId: "flavorfleet-a9b09",
  storageBucket: "flavorfleet-a9b09.appspot.com",
  messagingSenderId: "123456789012", // Replace with your actual sender ID
  appId: "1:123456789012:web:abcdefghijklmnop" // Replace with your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize messaging (for push notifications)
let messaging: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { messaging };

// Utility functions for client-side operations
export const getImageUrl = (path: string): string => {
  return `https://storage.googleapis.com/flavorfleet-a9b09.appspot.com/${path}`;
};

export const extractPathFromUrl = (url: string): string => {
  const bucketUrl = 'https://storage.googleapis.com/flavorfleet-a9b09.appspot.com/';
  return url.replace(bucketUrl, '');
};

// Image optimization utilities
export const getOptimizedImageUrl = (
  originalUrl: string, 
  width?: number, 
  height?: number, 
  quality?: number
): string => {
  // For now, return the original URL
  // In production, you might want to use a service like Cloudinary or implement
  // Firebase Extensions for image optimization
  return originalUrl;
};

export default app;