import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging, Message, MulticastMessage, Messaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK for messaging
let messaging: Messaging | null = null;

try {
  if (!getApps().length) {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      messaging = getMessaging();
      console.log('Firebase messaging initialized successfully');
    } else {
      console.warn('Firebase environment variables not found. Push notifications will be disabled.');
    }
  } else {
    messaging = getMessaging();
  }
} catch (error) {
  console.warn('Failed to initialize Firebase messaging:', error instanceof Error ? error.message : 'Unknown error');
  console.log('Push notifications will be disabled');
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  clickAction?: string;
}

export interface NotificationTarget {
  userId: string;
  deviceTokens: string[];
  userType: 'customer' | 'restaurant' | 'driver';
}

export class NotificationService {
  private messaging: Messaging | null = messaging;

  /**
   * Send notification to a single device
   */
  async sendToDevice(token: string, payload: NotificationPayload): Promise<boolean> {
    if (!this.messaging) {
      console.warn('Firebase messaging not available. Cannot send notification to device.');
      return false;
    }

    try {
      const message: Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        webpush: payload.clickAction ? {
          fcmOptions: {
            link: payload.clickAction,
          },
        } : undefined,
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent message:', response);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(tokens: string[], payload: NotificationPayload): Promise<{
    successCount: number;
    failureCount: number;
    invalidTokens: string[];
  }> {
    if (!this.messaging) {
      console.warn('Firebase messaging not available. Cannot send notifications to multiple devices.');
      return {
        successCount: 0,
        failureCount: tokens.length,
        invalidTokens: [],
      };
    }

    try {
      const message: MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        webpush: payload.clickAction ? {
          fcmOptions: {
            link: payload.clickAction,
          },
        } : undefined,
      };

      const response = await this.messaging.sendEachForMulticast(message);
      
      // Collect invalid tokens for cleanup
      const invalidTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[idx]);
        }
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (error) {
      console.error('Error sending multicast message:', error);
      return {
        successCount: 0,
        failureCount: tokens.length,
        invalidTokens: [],
      };
    }
  }

  /**
   * Send notification to a topic (for broadcast messages)
   */
  async sendToTopic(topic: string, payload: NotificationPayload): Promise<boolean> {
    if (!this.messaging) {
      console.warn('Firebase messaging not available. Cannot send notification to topic.');
      return false;
    }

    try {
      const message: Message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        webpush: payload.clickAction ? {
          fcmOptions: {
            link: payload.clickAction,
          },
        } : undefined,
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent topic message:', response);
      return true;
    } catch (error) {
      console.error('Error sending topic message:', error);
      return false;
    }
  }

  /**
   * Subscribe users to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.messaging) {
      console.warn('Firebase messaging not available. Cannot subscribe to topic.');
      return false;
    }

    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      console.log('Successfully subscribed to topic:', response);
      return true;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  /**
   * Unsubscribe users from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.messaging) {
      console.warn('Firebase messaging not available. Cannot unsubscribe from topic.');
      return false;
    }

    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }
}

// Notification templates for different scenarios
export class NotificationTemplates {
  static orderPlaced(orderNumber: string, restaurantName: string): NotificationPayload {
    return {
      title: 'Order Confirmed! 🎉',
      body: `Your order #${orderNumber} from ${restaurantName} has been confirmed and is being prepared.`,
      data: {
        type: 'order_update',
        orderId: orderNumber,
        status: 'confirmed',
      },
      clickAction: `/orders/${orderNumber}`,
    };
  }

  static orderPreparing(orderNumber: string, restaurantName: string, estimatedTime: number): NotificationPayload {
    return {
      title: 'Order Being Prepared 👨‍🍳',
      body: `${restaurantName} is preparing your order #${orderNumber}. Estimated time: ${estimatedTime} minutes.`,
      data: {
        type: 'order_update',
        orderId: orderNumber,
        status: 'preparing',
        estimatedTime: estimatedTime.toString(),
      },
      clickAction: `/orders/${orderNumber}`,
    };
  }

  static orderReady(orderNumber: string, restaurantName: string): NotificationPayload {
    return {
      title: 'Order Ready for Pickup! 📦',
      body: `Your order #${orderNumber} from ${restaurantName} is ready and waiting for driver pickup.`,
      data: {
        type: 'order_update',
        orderId: orderNumber,
        status: 'ready',
      },
      clickAction: `/orders/${orderNumber}`,
    };
  }

  static orderOnTheWay(orderNumber: string, driverName: string, estimatedTime: number): NotificationPayload {
    return {
      title: 'Order On The Way! 🚗',
      body: `${driverName} has picked up your order #${orderNumber} and is on the way. ETA: ${estimatedTime} minutes.`,
      data: {
        type: 'order_update',
        orderId: orderNumber,
        status: 'on_the_way',
        driverName,
        estimatedTime: estimatedTime.toString(),
      },
      clickAction: `/orders/${orderNumber}/track`,
    };
  }

  static orderDelivered(orderNumber: string): NotificationPayload {
    return {
      title: 'Order Delivered! ✅',
      body: `Your order #${orderNumber} has been delivered. Enjoy your meal!`,
      data: {
        type: 'order_update',
        orderId: orderNumber,
        status: 'delivered',
      },
      clickAction: `/orders/${orderNumber}/review`,
    };
  }

  static orderCancelled(orderNumber: string, reason?: string): NotificationPayload {
    return {
      title: 'Order Cancelled ❌',
      body: `Your order #${orderNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      data: {
        type: 'order_update',
        orderId: orderNumber,
        status: 'cancelled',
        reason: reason || '',
      },
      clickAction: `/orders/${orderNumber}`,
    };
  }

  static newOrderForRestaurant(orderNumber: string, customerName: string, total: string): NotificationPayload {
    return {
      title: 'New Order Received! 🔔',
      body: `New order #${orderNumber} from ${customerName}. Total: ${total}`,
      data: {
        type: 'new_order',
        orderId: orderNumber,
        customerName,
        total,
      },
      clickAction: `/restaurant/orders/${orderNumber}`,
    };
  }

  static newDeliveryForDriver(orderNumber: string, restaurantName: string, deliveryFee: string): NotificationPayload {
    return {
      title: 'New Delivery Available! 🚗',
      body: `Delivery from ${restaurantName}. Order #${orderNumber}. Fee: ${deliveryFee}`,
      data: {
        type: 'new_delivery',
        orderId: orderNumber,
        restaurantName,
        deliveryFee,
      },
      clickAction: `/driver/deliveries/${orderNumber}`,
    };
  }

  static promotionAlert(title: string, description: string, restaurantName?: string): NotificationPayload {
    return {
      title: `🎉 ${title}`,
      body: description,
      data: {
        type: 'promotion',
        restaurantName: restaurantName || '',
      },
      clickAction: '/promotions',
    };
  }

  static newRestaurantAlert(restaurantName: string, cuisineType: string): NotificationPayload {
    return {
      title: 'New Restaurant Available! 🍽️',
      body: `${restaurantName} is now delivering ${cuisineType} food in your area.`,
      data: {
        type: 'new_restaurant',
        restaurantName,
        cuisineType,
      },
      clickAction: `/restaurants/${restaurantName}`,
    };
  }

  static paymentSettled(amount: string, driverId: string): NotificationPayload {
    return {
      title: 'Payment Settled! 💰',
      body: `Your earnings of ${amount} have been settled to your account.`,
      data: {
        type: 'payment_settled',
        amount,
        driverId,
      },
      clickAction: '/driver/earnings',
    };
  }

  static loyaltyPointsEarned(points: number, orderNumber: string): NotificationPayload {
    return {
      title: 'Loyalty Points Earned! ⭐',
      body: `You earned ${points} loyalty points from order #${orderNumber}.`,
      data: {
        type: 'loyalty_points',
        points: points.toString(),
        orderId: orderNumber,
      },
      clickAction: '/loyalty',
    };
  }

  static reminderOrderAgain(restaurantName: string, lastOrderDate: string): NotificationPayload {
    return {
      title: 'Missing Your Favorite? 😋',
      body: `It's been a while since you ordered from ${restaurantName}. Order again and get 10% off!`,
      data: {
        type: 'reminder',
        restaurantName,
        lastOrderDate,
        discount: '10',
      },
      clickAction: `/restaurants/${restaurantName}`,
    };
  }
}

// Singleton instance
export const notificationService = new NotificationService();