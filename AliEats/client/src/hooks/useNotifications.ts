import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { app } from '../services/firebase';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newRestaurants: boolean;
  marketing: boolean;
  driverUpdates: boolean;
  restaurantUpdates: boolean;
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  });
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial permission status
  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default',
      });
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setError('This browser does not support notifications');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const permission = await Notification.requestPermission();
      
      const newPermissionState = {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      };
      
      setPermission(newPermissionState);

      if (permission === 'granted') {
        await registerDevice();
        return true;
      } else {
        setError('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setError('Failed to request notification permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register device for push notifications
  const registerDevice = useCallback(async (): Promise<string | null> => {
    try {
      const messaging = getMessaging(app);
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });

      if (token) {
        setDeviceToken(token);

        // Register token with backend
        const response = await fetch('/api/notifications/register-device', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceToken: token,
            platform: 'web',
            deviceInfo: {
              userAgent: navigator.userAgent,
              deviceId: token.slice(-10), // Use last 10 chars as device ID
              appVersion: process.env.REACT_APP_VERSION || '1.0.0',
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to register device token');
        }

        return token;
      } else {
        throw new Error('No registration token available');
      }
    } catch (error) {
      console.error('Error registering device:', error);
      setError('Failed to register device for notifications');
      return null;
    }
  }, []);

  // Unregister device
  const unregisterDevice = useCallback(async (): Promise<boolean> => {
    if (!deviceToken) return true;

    try {
      const response = await fetch('/api/notifications/unregister-device', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceToken,
        }),
      });

      if (response.ok) {
        setDeviceToken(null);
        return true;
      } else {
        throw new Error('Failed to unregister device');
      }
    } catch (error) {
      console.error('Error unregistering device:', error);
      setError('Failed to unregister device');
      return false;
    }
  }, [deviceToken]);

  // Set up foreground message listener
  useEffect(() => {
    if (!permission.granted) return;

    const messaging = getMessaging(app);
    
    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      console.log('Foreground message received:', payload);
      
      // Show browser notification if the app is in focus
      if (payload.notification) {
        const { title, body, image } = payload.notification;
        
        const notificationOptions: NotificationOptions = {
          body: body || '',
          icon: '/favicon.ico',
          image: image,
          badge: '/favicon.ico',
          data: payload.data,
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View',
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
            },
          ],
        };

        const notification = new Notification(title || 'AliceEats', notificationOptions);
        
        notification.onclick = () => {
          // Handle notification click
          if (payload.data?.clickAction) {
            window.open(payload.data.clickAction, '_blank');
          }
          notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    });

    return unsubscribe;
  }, [permission.granted]);

  return {
    permission,
    deviceToken,
    isLoading,
    error,
    requestPermission,
    registerDevice,
    unregisterDevice,
  };
};

// Hook for managing notification preferences
export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderUpdates: true,
    promotions: true,
    newRestaurants: false,
    marketing: false,
    driverUpdates: true,
    restaurantUpdates: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/notifications/preferences');
      const result = await response.json();

      if (result.success) {
        setPreferences(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      setError('Failed to fetch notification preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      const result = await response.json();

      if (result.success) {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      setError('Failed to update notification preferences');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
};

// Hook for notification history
export const useNotificationHistory = () => {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch notification history
  const fetchHistory = useCallback(async (page = 1, type?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(type && { type }),
      });

      const response = await fetch(`/api/notifications/history?${params}`);
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching notification history:', error);
      setError('Failed to fetch notification history');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Load initial history
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    fetchHistory,
    markAsRead,
    markAllAsRead,
  };
};

// Hook for sending test notifications (development)
export const useTestNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTestNotification = useCallback(async (deviceToken: string, type = 'order_placed') => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceToken,
          type,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Failed to send test notification');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendTestNotification,
    isLoading,
    error,
  };
};