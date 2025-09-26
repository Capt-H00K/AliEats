import { Router } from 'express';
import { z } from 'zod';
import { 
  insertDriverProfileSchema, 
  selectDriverProfileSchema,
  type DriverProfile,
  type InsertDriverProfile 
} from '@shared/schema';

const router = Router();

// Validation schemas
const createDriverProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  vehicleInfo: z.object({
    make: z.string().min(1, 'Vehicle make is required'),
    model: z.string().min(1, 'Vehicle model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    color: z.string().min(1, 'Vehicle color is required'),
    licensePlate: z.string().min(1, 'License plate is required'),
  }),
  bankDetails: z.object({
    accountName: z.string().min(1, 'Account name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    routingNumber: z.string().min(1, 'Routing number is required'),
  }),
  customFees: z.object({
    deliveryFee: z.number().min(0, 'Delivery fee must be non-negative'),
    speedPointFee: z.number().min(0).optional(),
    additionalFees: z.array(z.object({
      name: z.string().min(1, 'Fee name is required'),
      amount: z.number().min(0, 'Fee amount must be non-negative'),
    })).optional(),
  }),
});

const updateDriverProfileSchema = createDriverProfileSchema.partial();

const updateCustomFeesSchema = z.object({
  deliveryFee: z.number().min(0, 'Delivery fee must be non-negative'),
  speedPointFee: z.number().min(0).optional(),
  additionalFees: z.array(z.object({
    name: z.string().min(1, 'Fee name is required'),
    amount: z.number().min(0, 'Fee amount must be non-negative'),
  })).optional(),
});

// Create driver profile
router.post('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = createDriverProfileSchema.parse(req.body);
    
    const driverData: InsertDriverProfile = {
      userId,
      ...validatedData,
      isAvailable: false,
      currentDebt: '0.00',
    };

    // TODO: Use actual database storage
    // const driver = await storage.createDriverProfile(driverData);
    
    // For now, return mock data
    const mockDriver: DriverProfile = {
      id: 'driver-' + Date.now(),
      userId,
      ...validatedData,
      isAvailable: false,
      rating: '0.00',
      totalDeliveries: 0,
      currentDebt: '0.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: mockDriver,
    });
  } catch (error) {
    console.error('Create driver profile error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to create driver profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get driver profile by user ID
router.get('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    // TODO: Use actual database storage
    // const driver = await storage.getDriverProfileByUserId(userId);
    
    // For now, return mock data
    const mockDriver: DriverProfile = {
      id: 'driver-1',
      userId,
      firstName: 'John',
      lastName: 'Driver',
      licenseNumber: 'DL123456789',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Silver',
        licensePlate: 'ABC123',
      },
      bankDetails: {
        accountName: 'John Driver',
        accountNumber: '1234567890',
        bankName: 'Driver Bank',
        routingNumber: '123456789',
      },
      customFees: {
        deliveryFee: 3.99,
        speedPointFee: 1.50,
        additionalFees: [
          { name: 'Night Delivery', amount: 2.00 },
          { name: 'Weekend Premium', amount: 1.00 },
        ],
      },
      isAvailable: true,
      rating: '4.7',
      totalDeliveries: 342,
      currentDebt: '45.50',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: mockDriver,
    });
  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({
      error: 'Failed to get driver profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update driver profile
router.put('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = updateDriverProfileSchema.parse(req.body);
    
    // TODO: Use actual database storage
    // const driver = await storage.updateDriverProfile(userId, validatedData);
    
    // For now, return mock updated data
    const mockUpdatedDriver: DriverProfile = {
      id: 'driver-1',
      userId,
      firstName: validatedData.firstName || 'John',
      lastName: validatedData.lastName || 'Driver',
      licenseNumber: validatedData.licenseNumber || 'DL123456789',
      vehicleInfo: validatedData.vehicleInfo || {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Silver',
        licensePlate: 'ABC123',
      },
      bankDetails: validatedData.bankDetails || {
        accountName: 'John Driver',
        accountNumber: '1234567890',
        bankName: 'Driver Bank',
        routingNumber: '123456789',
      },
      customFees: validatedData.customFees || {
        deliveryFee: 3.99,
        speedPointFee: 1.50,
        additionalFees: [],
      },
      isAvailable: true,
      rating: '4.7',
      totalDeliveries: 342,
      currentDebt: '45.50',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: mockUpdatedDriver,
    });
  } catch (error) {
    console.error('Update driver profile error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to update driver profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update custom fees
router.put('/fees', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = updateCustomFeesSchema.parse(req.body);
    
    // TODO: Use actual database storage
    // const driver = await storage.updateDriverFees(userId, validatedData);
    
    res.json({
      success: true,
      message: 'Custom fees updated successfully',
      data: validatedData,
    });
  } catch (error) {
    console.error('Update driver fees error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to update driver fees',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Toggle driver availability
router.patch('/availability', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        error: 'isAvailable must be a boolean value',
      });
    }

    // TODO: Use actual database storage
    // const driver = await storage.updateDriverAvailability(userId, isAvailable);
    
    res.json({
      success: true,
      message: `Driver ${isAvailable ? 'is now available' : 'is now unavailable'} for deliveries`,
    });
  } catch (error) {
    console.error('Update driver availability error:', error);
    res.status(500).json({
      error: 'Failed to update driver availability',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all available drivers (for order assignment)
router.get('/available', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    // TODO: Use actual database storage with geolocation
    // const drivers = await storage.getAvailableDrivers({
    //   lat: Number(lat),
    //   lng: Number(lng),
    //   radius: Number(radius),
    // });

    // For now, return mock data
    const mockDrivers = [
      {
        id: 'driver-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Driver',
        rating: '4.7',
        totalDeliveries: 342,
        customFees: {
          deliveryFee: 3.99,
          speedPointFee: 1.50,
          additionalFees: [
            { name: 'Night Delivery', amount: 2.00 },
          ],
        },
        vehicleInfo: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'Silver',
          licensePlate: 'ABC123',
        },
        estimatedArrival: 15, // minutes
        distance: 2.3, // miles
      },
      {
        id: 'driver-2',
        userId: 'user-2',
        firstName: 'Jane',
        lastName: 'Delivery',
        rating: '4.9',
        totalDeliveries: 567,
        customFees: {
          deliveryFee: 4.50,
          speedPointFee: 2.00,
          additionalFees: [],
        },
        vehicleInfo: {
          make: 'Honda',
          model: 'Civic',
          year: 2021,
          color: 'Blue',
          licensePlate: 'XYZ789',
        },
        estimatedArrival: 12, // minutes
        distance: 1.8, // miles
      },
    ];

    res.json({
      success: true,
      data: mockDrivers,
    });
  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({
      error: 'Failed to get available drivers',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Calculate delivery fee for a specific driver and order
router.post('/calculate-fee', async (req, res) => {
  try {
    const { driverId, orderDetails } = req.body;
    
    if (!driverId || !orderDetails) {
      return res.status(400).json({
        error: 'Driver ID and order details are required',
      });
    }

    // TODO: Use actual database storage to get driver fees
    // const driver = await storage.getDriverById(driverId);
    
    // For now, use mock calculation
    const mockDriver = {
      customFees: {
        deliveryFee: 3.99,
        speedPointFee: 1.50,
        additionalFees: [
          { name: 'Night Delivery', amount: 2.00 },
          { name: 'Weekend Premium', amount: 1.00 },
        ],
      },
    };

    let totalFee = mockDriver.customFees.deliveryFee;
    const appliedFees = [
      { name: 'Base Delivery Fee', amount: mockDriver.customFees.deliveryFee },
    ];

    // Apply SpeedPoint fee if requested
    if (orderDetails.speedPoint && mockDriver.customFees.speedPointFee) {
      totalFee += mockDriver.customFees.speedPointFee;
      appliedFees.push({
        name: 'SpeedPoint Fee',
        amount: mockDriver.customFees.speedPointFee,
      });
    }

    // Apply additional fees based on conditions
    const currentHour = new Date().getHours();
    const isNight = currentHour < 6 || currentHour > 22;
    const isWeekend = [0, 6].includes(new Date().getDay());

    if (isNight) {
      const nightFee = mockDriver.customFees.additionalFees?.find(fee => fee.name === 'Night Delivery');
      if (nightFee) {
        totalFee += nightFee.amount;
        appliedFees.push(nightFee);
      }
    }

    if (isWeekend) {
      const weekendFee = mockDriver.customFees.additionalFees?.find(fee => fee.name === 'Weekend Premium');
      if (weekendFee) {
        totalFee += weekendFee.amount;
        appliedFees.push(weekendFee);
      }
    }

    res.json({
      success: true,
      data: {
        driverId,
        totalFee: Number(totalFee.toFixed(2)),
        appliedFees,
        breakdown: {
          baseFee: mockDriver.customFees.deliveryFee,
          speedPointFee: orderDetails.speedPoint ? mockDriver.customFees.speedPointFee : 0,
          additionalFees: appliedFees.slice(1).reduce((sum, fee) => sum + fee.amount, 0),
        },
      },
    });
  } catch (error) {
    console.error('Calculate delivery fee error:', error);
    res.status(500).json({
      error: 'Failed to calculate delivery fee',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get driver statistics
router.get('/stats', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    // TODO: Use actual database storage
    // const stats = await storage.getDriverStats(userId);
    
    // For now, return mock stats
    const mockStats = {
      totalDeliveries: 342,
      totalEarnings: 2847.50,
      currentDebt: 45.50,
      averageRating: 4.7,
      completionRate: 98.5,
      onTimeRate: 94.2,
      thisWeek: {
        deliveries: 23,
        earnings: 187.25,
        hours: 28.5,
      },
      thisMonth: {
        deliveries: 89,
        earnings: 742.80,
        hours: 112.3,
      },
      recentDeliveries: [
        {
          id: 'order-1',
          restaurantName: 'Pizza Palace',
          customerName: 'John D.',
          amount: 24.99,
          fee: 3.99,
          tip: 5.00,
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          rating: 5,
        },
        {
          id: 'order-2',
          restaurantName: 'Burger Barn',
          customerName: 'Sarah M.',
          amount: 18.50,
          fee: 3.99,
          tip: 3.50,
          completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          rating: 4,
        },
      ],
    };

    res.json({
      success: true,
      data: mockStats,
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({
      error: 'Failed to get driver statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;