import { Router } from 'express';
import { z } from 'zod';
import { notificationService, NotificationTemplates } from './notificationService.js';
import { 
  insertNotificationSchema, 
  selectNotificationSchema,
  type Notification,
  type InsertNotification 
} from '@shared/schema';

const router = Router();

// Validation schemas
const registerDeviceSchema = z.object({
  deviceToken: z.string().min(1, 'Device token is required'),
  platform: z.enum(['web', 'ios', 'android']),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    deviceId: z.string().optional(),
    appVersion: z.string().optional(),
  }).optional(),
});

const sendNotificationSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  data: z.record(z.string()).optional(),
  imageUrl: z.string().optional(),
  clickAction: z.string().optional(),
  scheduleAt: z.string().optional(), // ISO date string
});

const sendTopicNotificationSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  data: z.record(z.string()).optional(),
  imageUrl: z.string().optional(),
  clickAction: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  orderUpdates: z.boolean().optional(),
  promotions: z.boolean().optional(),
  newRestaurants: z.boolean().optional(),
  marketing: z.boolean().optional(),
  driverUpdates: z.boolean().optional(),
  restaurantUpdates: z.boolean().optional(),
});

// Register device token for push notifications
router.post('/register-device', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = registerDeviceSchema.parse(req.body);
    
    // TODO: Store device token in database
    // await storage.registerDeviceToken(userId, validatedData);
    
    // Subscribe to user-specific topic for targeted notifications
    const userTopic = `user_${userId}`;
    await notificationService.subscribeToTopic([validatedData.deviceToken], userTopic);
    
    // Subscribe to general topics based on user type
    // TODO: Get user type from database
    const userType = req.user?.type || 'customer'; // customer, restaurant, driver
    await notificationService.subscribeToTopic([validatedData.deviceToken], `${userType}_updates`);
    
    res.json({
      success: true,
      message: 'Device registered successfully for push notifications',
    });
  } catch (error) {
    console.error('Register device error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to register device',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Unregister device token
router.delete('/unregister-device', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { deviceToken } = req.body;
    
    if (!deviceToken) {
      return res.status(400).json({
        error: 'Device token is required',
      });
    }

    // TODO: Remove device token from database
    // await storage.unregisterDeviceToken(userId, deviceToken);
    
    // Unsubscribe from topics
    const userTopic = `user_${userId}`;
    await notificationService.unsubscribeFromTopic([deviceToken], userTopic);
    
    res.json({
      success: true,
      message: 'Device unregistered successfully',
    });
  } catch (error) {
    console.error('Unregister device error:', error);
    res.status(500).json({
      error: 'Failed to unregister device',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Send notification to specific users
router.post('/send', async (req, res) => {
  try {
    // TODO: Add admin/system authentication middleware
    
    const validatedData = sendNotificationSchema.parse(req.body);
    
    // TODO: Get device tokens for users from database
    // const deviceTokens = await storage.getDeviceTokensForUsers(validatedData.userIds);
    
    // For now, use mock device tokens
    const mockDeviceTokens = ['mock-token-1', 'mock-token-2'];
    
    const payload = {
      title: validatedData.title,
      body: validatedData.body,
      data: validatedData.data,
      imageUrl: validatedData.imageUrl,
      clickAction: validatedData.clickAction,
    };

    if (validatedData.scheduleAt) {
      // TODO: Implement scheduled notifications
      // For now, just send immediately
      console.log('Scheduled notification requested for:', validatedData.scheduleAt);
    }

    const result = await notificationService.sendToMultipleDevices(mockDeviceTokens, payload);
    
    // TODO: Store notification in database for history
    // const notificationRecord: InsertNotification = {
    //   title: validatedData.title,
    //   body: validatedData.body,
    //   data: validatedData.data,
    //   imageUrl: validatedData.imageUrl,
    //   clickAction: validatedData.clickAction,
    //   userIds: validatedData.userIds,
    //   sentAt: new Date(),
    //   successCount: result.successCount,
    //   failureCount: result.failureCount,
    // };
    // await storage.createNotification(notificationRecord);

    res.json({
      success: true,
      message: 'Notifications sent successfully',
      result: {
        successCount: result.successCount,
        failureCount: result.failureCount,
        invalidTokens: result.invalidTokens.length,
      },
    });
  } catch (error) {
    console.error('Send notification error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to send notifications',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Send notification to topic (broadcast)
router.post('/send-topic', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const validatedData = sendTopicNotificationSchema.parse(req.body);
    
    const payload = {
      title: validatedData.title,
      body: validatedData.body,
      data: validatedData.data,
      imageUrl: validatedData.imageUrl,
      clickAction: validatedData.clickAction,
    };

    const success = await notificationService.sendToTopic(validatedData.topic, payload);
    
    res.json({
      success,
      message: success ? 'Topic notification sent successfully' : 'Failed to send topic notification',
    });
  } catch (error) {
    console.error('Send topic notification error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to send topic notification',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Order-specific notification endpoints
router.post('/order/:orderId/placed', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { restaurantName, customerUserId } = req.body;
    
    // TODO: Get customer device tokens from database
    const mockDeviceTokens = ['customer-token'];
    
    const payload = NotificationTemplates.orderPlaced(orderId, restaurantName);
    await notificationService.sendToMultipleDevices(mockDeviceTokens, payload);
    
    res.json({ success: true, message: 'Order placed notification sent' });
  } catch (error) {
    console.error('Order placed notification error:', error);
    res.status(500).json({ error: 'Failed to send order placed notification' });
  }
});

router.post('/order/:orderId/preparing', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { restaurantName, estimatedTime, customerUserId } = req.body;
    
    const mockDeviceTokens = ['customer-token'];
    
    const payload = NotificationTemplates.orderPreparing(orderId, restaurantName, estimatedTime);
    await notificationService.sendToMultipleDevices(mockDeviceTokens, payload);
    
    res.json({ success: true, message: 'Order preparing notification sent' });
  } catch (error) {
    console.error('Order preparing notification error:', error);
    res.status(500).json({ error: 'Failed to send order preparing notification' });
  }
});

router.post('/order/:orderId/ready', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { restaurantName, customerUserId } = req.body;
    
    const mockDeviceTokens = ['customer-token'];
    
    const payload = NotificationTemplates.orderReady(orderId, restaurantName);
    await notificationService.sendToMultipleDevices(mockDeviceTokens, payload);
    
    res.json({ success: true, message: 'Order ready notification sent' });
  } catch (error) {
    console.error('Order ready notification error:', error);
    res.status(500).json({ error: 'Failed to send order ready notification' });
  }
});

router.post('/order/:orderId/on-the-way', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverName, estimatedTime, customerUserId } = req.body;
    
    const mockDeviceTokens = ['customer-token'];
    
    const payload = NotificationTemplates.orderOnTheWay(orderId, driverName, estimatedTime);
    await notificationService.sendToMultipleDevices(mockDeviceTokens, payload);
    
    res.json({ success: true, message: 'Order on the way notification sent' });
  } catch (error) {
    console.error('Order on the way notification error:', error);
    res.status(500).json({ error: 'Failed to send order on the way notification' });
  }
});

router.post('/order/:orderId/delivered', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { customerUserId } = req.body;
    
    const mockDeviceTokens = ['customer-token'];
    
    const payload = NotificationTemplates.orderDelivered(orderId);
    await notificationService.sendToMultipleDevices(mockDeviceTokens, payload);
    
    res.json({ success: true, message: 'Order delivered notification sent' });
  } catch (error) {
    console.error('Order delivered notification error:', error);
    res.status(500).json({ error: 'Failed to send order delivered notification' });
  }
});

// Get user's notification history
router.get('/history', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { page = 1, limit = 20, type } = req.query;
    
    // TODO: Get notifications from database
    // const notifications = await storage.getUserNotifications(userId, {
    //   page: Number(page),
    //   limit: Number(limit),
    //   type: type as string,
    // });

    // For now, return mock notification history
    const mockNotifications = [
      {
        id: 'notif-1',
        title: 'Order Delivered! ✅',
        body: 'Your order #1234 has been delivered. Enjoy your meal!',
        type: 'order_update',
        data: { orderId: '1234', status: 'delivered' },
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: 'notif-2',
        title: 'Order On The Way! 🚗',
        body: 'John Driver has picked up your order #1234 and is on the way.',
        type: 'order_update',
        data: { orderId: '1234', status: 'on_the_way', driverName: 'John Driver' },
        isRead: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: 'notif-3',
        title: '🎉 Special Offer!',
        body: 'Get 20% off your next order from Pizza Palace!',
        type: 'promotion',
        data: { restaurantName: 'Pizza Palace', discount: '20' },
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ];

    // Apply type filter
    let filteredNotifications = mockNotifications;
    if (type) {
      filteredNotifications = mockNotifications.filter(notif => notif.type === type);
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredNotifications.length,
          totalPages: Math.ceil(filteredNotifications.length / Number(limit)),
        },
        unreadCount: mockNotifications.filter(n => !n.isRead).length,
      },
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      error: 'Failed to get notification history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { notificationId } = req.params;
    
    // TODO: Update notification in database
    // await storage.markNotificationAsRead(userId, notificationId);
    
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    // TODO: Update all notifications in database
    // await storage.markAllNotificationsAsRead(userId);
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update notification preferences
router.put('/preferences', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = updatePreferencesSchema.parse(req.body);
    
    // TODO: Update preferences in database
    // await storage.updateNotificationPreferences(userId, validatedData);
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: validatedData,
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to update notification preferences',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get notification preferences
router.get('/preferences', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    // TODO: Get preferences from database
    // const preferences = await storage.getNotificationPreferences(userId);
    
    // For now, return mock preferences
    const mockPreferences = {
      orderUpdates: true,
      promotions: true,
      newRestaurants: false,
      marketing: false,
      driverUpdates: true,
      restaurantUpdates: true,
    };

    res.json({
      success: true,
      data: mockPreferences,
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      error: 'Failed to get notification preferences',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test notification endpoint (development only)
router.post('/test', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'Test notifications are not available in production',
      });
    }

    const { deviceToken, type = 'order_placed' } = req.body;
    
    if (!deviceToken) {
      return res.status(400).json({
        error: 'Device token is required for test notification',
      });
    }

    let payload;
    switch (type) {
      case 'order_placed':
        payload = NotificationTemplates.orderPlaced('TEST123', 'Test Restaurant');
        break;
      case 'order_delivered':
        payload = NotificationTemplates.orderDelivered('TEST123');
        break;
      case 'promotion':
        payload = NotificationTemplates.promotionAlert('Test Promotion', 'This is a test promotion notification');
        break;
      default:
        payload = {
          title: 'Test Notification',
          body: 'This is a test notification from AliceEats',
          data: { type: 'test' },
        };
    }

    const success = await notificationService.sendToDevice(deviceToken, payload);
    
    res.json({
      success,
      message: success ? 'Test notification sent successfully' : 'Failed to send test notification',
      payload,
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      error: 'Failed to send test notification',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;