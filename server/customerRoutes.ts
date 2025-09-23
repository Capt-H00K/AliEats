import { Router } from 'express';
import { z } from 'zod';
import { 
  insertCustomerProfileSchema, 
  selectCustomerProfileSchema,
  type CustomerProfile,
  type InsertCustomerProfile 
} from '@shared/schema';

const router = Router();

// Validation schemas
const createCustomerProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().optional(),
  profilePicture: z.string().optional(),
  addresses: z.array(z.object({
    id: z.string().optional(),
    label: z.string().min(1, 'Address label is required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 digits'),
    isDefault: z.boolean(),
    deliveryInstructions: z.string().optional(),
  })).min(1, 'At least one address is required'),
  preferences: z.object({
    cuisineTypes: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    spiceLevel: z.enum(['mild', 'medium', 'hot', 'extra_hot']).optional(),
    notifications: z.object({
      orderUpdates: z.boolean(),
      promotions: z.boolean(),
      newRestaurants: z.boolean(),
    }),
  }),
});

const updateCustomerProfileSchema = createCustomerProfileSchema.partial();

const updateAddressSchema = z.object({
  label: z.string().min(1, 'Address label is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 digits'),
  isDefault: z.boolean().optional(),
  deliveryInstructions: z.string().optional(),
});

// Create customer profile
router.post('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = createCustomerProfileSchema.parse(req.body);
    
    const customerData: InsertCustomerProfile = {
      userId,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      dateOfBirth: validatedData.dateOfBirth,
      profilePicture: validatedData.profilePicture,
      addresses: validatedData.addresses,
      preferences: validatedData.preferences,
    };

    // TODO: Use actual database storage
    // const customer = await storage.createCustomerProfile(customerData);
    
    // For now, return mock data
    const mockCustomer: CustomerProfile = {
      id: 'customer-' + Date.now(),
      userId,
      ...customerData,
      loyaltyPoints: 0,
      totalOrders: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: mockCustomer,
    });
  } catch (error) {
    console.error('Create customer profile error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to create customer profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get customer profile by user ID
router.get('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    // TODO: Use actual database storage
    // const customer = await storage.getCustomerProfileByUserId(userId);
    
    // For now, return mock data
    const mockCustomer: CustomerProfile = {
      id: 'customer-1',
      userId,
      firstName: 'John',
      lastName: 'Customer',
      email: 'john.customer@example.com',
      phone: '(555) 123-4567',
      dateOfBirth: '1990-01-15',
      profilePicture: 'https://example.com/profile.jpg',
      addresses: [
        {
          id: 'addr-1',
          label: 'Home',
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          isDefault: true,
          deliveryInstructions: 'Ring doorbell twice',
        },
        {
          id: 'addr-2',
          label: 'Work',
          street: '456 Business Ave',
          city: 'Corporate City',
          state: 'CA',
          zipCode: '54321',
          isDefault: false,
          deliveryInstructions: 'Leave at reception desk',
        },
      ],
      preferences: {
        cuisineTypes: ['Italian', 'Mexican', 'Chinese'],
        dietaryRestrictions: ['Vegetarian'],
        spiceLevel: 'medium',
        notifications: {
          orderUpdates: true,
          promotions: true,
          newRestaurants: false,
        },
      },
      loyaltyPoints: 250,
      totalOrders: 15,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: mockCustomer,
    });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({
      error: 'Failed to get customer profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update customer profile
router.put('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = updateCustomerProfileSchema.parse(req.body);
    
    // TODO: Use actual database storage
    // const customer = await storage.updateCustomerProfile(userId, validatedData);
    
    // For now, return mock updated data
    const mockUpdatedCustomer: CustomerProfile = {
      id: 'customer-1',
      userId,
      firstName: validatedData.firstName || 'John',
      lastName: validatedData.lastName || 'Customer',
      email: validatedData.email || 'john.customer@example.com',
      phone: validatedData.phone || '(555) 123-4567',
      dateOfBirth: validatedData.dateOfBirth || '1990-01-15',
      profilePicture: validatedData.profilePicture || 'https://example.com/profile.jpg',
      addresses: validatedData.addresses || [],
      preferences: validatedData.preferences || {
        cuisineTypes: [],
        dietaryRestrictions: [],
        spiceLevel: 'medium',
        notifications: {
          orderUpdates: true,
          promotions: true,
          newRestaurants: false,
        },
      },
      loyaltyPoints: 250,
      totalOrders: 15,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: mockUpdatedCustomer,
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to update customer profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add new address
router.post('/addresses', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = updateAddressSchema.parse(req.body);
    
    // TODO: Use actual database storage
    // const address = await storage.addCustomerAddress(userId, validatedData);
    
    // For now, return mock data
    const mockAddress = {
      id: 'addr-' + Date.now(),
      ...validatedData,
    };

    res.status(201).json({
      success: true,
      data: mockAddress,
    });
  } catch (error) {
    console.error('Add address error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to add address',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update address
router.put('/addresses/:addressId', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { addressId } = req.params;
    
    const validatedData = updateAddressSchema.parse(req.body);
    
    // TODO: Use actual database storage
    // const address = await storage.updateCustomerAddress(userId, addressId, validatedData);
    
    // For now, return mock updated data
    const mockUpdatedAddress = {
      id: addressId,
      ...validatedData,
    };

    res.json({
      success: true,
      data: mockUpdatedAddress,
    });
  } catch (error) {
    console.error('Update address error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to update address',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete address
router.delete('/addresses/:addressId', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { addressId } = req.params;
    
    // TODO: Use actual database storage
    // await storage.deleteCustomerAddress(userId, addressId);
    
    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      error: 'Failed to delete address',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Set default address
router.patch('/addresses/:addressId/default', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { addressId } = req.params;
    
    // TODO: Use actual database storage
    // await storage.setDefaultAddress(userId, addressId);
    
    res.json({
      success: true,
      message: 'Default address updated successfully',
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      error: 'Failed to set default address',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get customer order history
router.get('/orders', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { page = 1, limit = 10, status } = req.query;
    
    // TODO: Use actual database storage
    // const orders = await storage.getCustomerOrders(userId, {
    //   page: Number(page),
    //   limit: Number(limit),
    //   status: status as string,
    // });

    // For now, return mock order history
    const mockOrders = [
      {
        id: 'order-1',
        restaurantId: 'restaurant-1',
        restaurantName: 'Pizza Palace',
        restaurantLogo: 'https://example.com/pizza-logo.jpg',
        status: 'delivered',
        items: [
          {
            id: 'item-1',
            name: 'Margherita Pizza',
            quantity: 1,
            price: '16.99',
            image: 'https://example.com/margherita.jpg',
          },
          {
            id: 'item-2',
            name: 'Garlic Bread',
            quantity: 2,
            price: '5.99',
            image: 'https://example.com/garlic-bread.jpg',
          },
        ],
        subtotal: '28.97',
        deliveryFee: '3.99',
        tax: '2.61',
        tip: '5.00',
        total: '40.57',
        deliveryAddress: {
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
        },
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 min later
        rating: 5,
        review: 'Great pizza, fast delivery!',
      },
      {
        id: 'order-2',
        restaurantId: 'restaurant-2',
        restaurantName: 'Burger Barn',
        restaurantLogo: 'https://example.com/burger-logo.jpg',
        status: 'delivered',
        items: [
          {
            id: 'item-3',
            name: 'Classic Beef Burger',
            quantity: 1,
            price: '14.99',
            image: 'https://example.com/beef-burger.jpg',
          },
          {
            id: 'item-4',
            name: 'French Fries',
            quantity: 1,
            price: '4.99',
            image: 'https://example.com/fries.jpg',
          },
        ],
        subtotal: '19.98',
        deliveryFee: '2.99',
        tax: '1.80',
        tip: '3.50',
        total: '28.27',
        deliveryAddress: {
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
        },
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 min later
        rating: 4,
        review: 'Good burger, could use more seasoning.',
      },
    ];

    // Apply status filter
    let filteredOrders = mockOrders;
    if (status) {
      filteredOrders = mockOrders.filter(order => order.status === status);
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredOrders.length,
          totalPages: Math.ceil(filteredOrders.length / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      error: 'Failed to get customer orders',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get customer favorites
router.get('/favorites', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { type = 'all' } = req.query; // 'restaurants', 'menu_items', or 'all'
    
    // TODO: Use actual database storage
    // const favorites = await storage.getCustomerFavorites(userId, type as string);

    // For now, return mock favorites
    const mockFavorites = {
      restaurants: [
        {
          id: 'restaurant-1',
          name: 'Pizza Palace',
          logo: 'https://example.com/pizza-logo.jpg',
          rating: '4.8',
          cuisineTypes: ['Italian', 'Pizza'],
          estimatedDeliveryTime: 25,
          addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'restaurant-3',
          name: 'Sushi Station',
          logo: 'https://example.com/sushi-logo.jpg',
          rating: '4.9',
          cuisineTypes: ['Japanese', 'Sushi'],
          estimatedDeliveryTime: 35,
          addedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      ],
      menuItems: [
        {
          id: 'menu-1',
          restaurantId: 'restaurant-1',
          restaurantName: 'Pizza Palace',
          name: 'Margherita Pizza',
          price: '16.99',
          image: 'https://example.com/margherita.jpg',
          addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'menu-5',
          restaurantId: 'restaurant-3',
          restaurantName: 'Sushi Station',
          name: 'California Roll',
          price: '12.99',
          image: 'https://example.com/california-roll.jpg',
          addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ],
    };

    let result = mockFavorites;
    if (type === 'restaurants') {
      result = { restaurants: mockFavorites.restaurants, menuItems: [] };
    } else if (type === 'menu_items') {
      result = { restaurants: [], menuItems: mockFavorites.menuItems };
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get customer favorites error:', error);
    res.status(500).json({
      error: 'Failed to get customer favorites',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add to favorites
router.post('/favorites', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { type, itemId } = req.body;
    
    if (!['restaurant', 'menu_item'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid favorite type. Must be "restaurant" or "menu_item"',
      });
    }

    if (!itemId) {
      return res.status(400).json({
        error: 'Item ID is required',
      });
    }

    // TODO: Use actual database storage
    // await storage.addToFavorites(userId, type, itemId);
    
    res.json({
      success: true,
      message: 'Added to favorites successfully',
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      error: 'Failed to add to favorites',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Remove from favorites
router.delete('/favorites/:type/:itemId', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { type, itemId } = req.params;
    
    if (!['restaurant', 'menu_item'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid favorite type. Must be "restaurant" or "menu_item"',
      });
    }

    // TODO: Use actual database storage
    // await storage.removeFromFavorites(userId, type, itemId);
    
    res.json({
      success: true,
      message: 'Removed from favorites successfully',
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      error: 'Failed to remove from favorites',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get customer loyalty points
router.get('/loyalty', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    // TODO: Use actual database storage
    // const loyaltyData = await storage.getCustomerLoyalty(userId);

    // For now, return mock loyalty data
    const mockLoyaltyData = {
      currentPoints: 250,
      totalEarned: 450,
      totalRedeemed: 200,
      tier: 'Silver',
      nextTier: 'Gold',
      pointsToNextTier: 250,
      recentTransactions: [
        {
          id: 'loyalty-1',
          type: 'earned',
          points: 25,
          description: 'Order #1234 - Pizza Palace',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'loyalty-2',
          type: 'earned',
          points: 20,
          description: 'Order #1235 - Burger Barn',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'loyalty-3',
          type: 'redeemed',
          points: -50,
          description: 'Discount on Order #1230',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ],
      availableRewards: [
        {
          id: 'reward-1',
          name: '$5 Off Next Order',
          pointsCost: 100,
          description: 'Get $5 off your next order of $25 or more',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'reward-2',
          name: 'Free Delivery',
          pointsCost: 50,
          description: 'Free delivery on your next order',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
    };

    res.json({
      success: true,
      data: mockLoyaltyData,
    });
  } catch (error) {
    console.error('Get customer loyalty error:', error);
    res.status(500).json({
      error: 'Failed to get customer loyalty data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;