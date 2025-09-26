// Firebase messaging service worker for handling background notifications

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const { title, body, image } = payload.notification || {};
  const { clickAction, orderId, type } = payload.data || {};

  // Customize notification options
  const notificationOptions = {
    body: body || 'You have a new notification from AliceEats',
    icon: '/favicon.ico',
    image: image,
    badge: '/favicon.ico',
    data: {
      ...payload.data,
      clickAction: clickAction || '/',
    },
    requireInteraction: true,
    actions: getNotificationActions(type),
    tag: `aliceeats-${type || 'general'}`,
    renotify: true,
  };

  // Show notification
  self.registration.showNotification(
    title || 'AliceEats',
    notificationOptions
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const { action, data } = event;
  const { clickAction, orderId, type } = data || {};

  let url = clickAction || '/';

  // Handle different actions
  switch (action) {
    case 'view_order':
      url = `/orders/${orderId}`;
      break;
    case 'track_order':
      url = `/orders/${orderId}/track`;
      break;
    case 'rate_order':
      url = `/orders/${orderId}/review`;
      break;
    case 'view_restaurant':
      url = `/restaurants/${data.restaurantId}`;
      break;
    case 'view_promotions':
      url = '/promotions';
      break;
    case 'dismiss':
      return; // Just close the notification
    default:
      // Use the clickAction from the payload
      break;
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'order_update':
      return [
        {
          action: 'view_order',
          title: 'View Order',
          icon: '/icons/view.png'
        },
        {
          action: 'track_order',
          title: 'Track',
          icon: '/icons/track.png'
        }
      ];
    
    case 'order_delivered':
      return [
        {
          action: 'rate_order',
          title: 'Rate Order',
          icon: '/icons/star.png'
        },
        {
          action: 'view_order',
          title: 'View Order',
          icon: '/icons/view.png'
        }
      ];
    
    case 'promotion':
      return [
        {
          action: 'view_promotions',
          title: 'View Offers',
          icon: '/icons/gift.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/close.png'
        }
      ];
    
    default:
      return [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/close.png'
        }
      ];
  }
}

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(clients.claim());
});