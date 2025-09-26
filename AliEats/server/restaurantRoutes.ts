import { Router } from 'express';
import { z } from 'zod';
import { 
  insertRestaurantProfileSchema, 
  selectRestaurantProfileSchema,
  type RestaurantProfile,
  type InsertRestaurantProfile 
} from '@shared/schema';

const router = Router();

// Validation schemas
const createRestaurantProfileSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  description: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  contactInfo: z.object({
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Valid email is required'),
    website: z.string().url().optional().or(z.literal('')),
  }),
  bankDetails: z.object({
    accountName: z.string().min(1, 'Account name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    routingNumber: z.string().min(1, 'Routing number is required'),
  }),
  openingHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  })),
  cuisineTypes: z.array(z.string()).min(1, 'At least one cuisine type is required'),
});

const updateRestaurantProfileSchema = createRestaurantProfileSchema.partial();

// Create restaurant profile
router.post('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = createRestaurantProfileSchema.parse(req.body);
    
    const restaurantData: InsertRestaurantProfile = {
      userId,
      ...validatedData,
      isActive: true,
    };

    // TODO: Use actual database storage
    // const restaurant = await storage.createRestaurantProfile(restaurantData);
    
    // For now, return mock data
    const mockRestaurant: RestaurantProfile = {
      id: 'restaurant-' + Date.now(),
      userId,
      ...validatedData,
      rating: '0.00',
      totalReviews: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: mockRestaurant,
    });
  } catch (error) {
    console.error('Create restaurant profile error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to create restaurant profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get restaurant profile by user ID
router.get('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    // TODO: Use actual database storage
    // const restaurant = await storage.getRestaurantProfileByUserId(userId);
    
    // For now, return mock data
    const mockRestaurant: RestaurantProfile = {
      id: 'restaurant-1',
      userId,
      name: 'Sample Restaurant',
      description: 'A great place to eat',
      logo: '',
      coverImage: '',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
      },
      contactInfo: {
        phone: '(555) 123-4567',
        email: 'restaurant@example.com',
        website: 'https://restaurant.com',
      },
      bankDetails: {
        accountName: 'Restaurant LLC',
        accountNumber: '1234567890',
        bankName: 'Sample Bank',
        routingNumber: '123456789',
      },
      openingHours: {
        monday: { open: '09:00', close: '21:00', isOpen: true },
        tuesday: { open: '09:00', close: '21:00', isOpen: true },
        wednesday: { open: '09:00', close: '21:00', isOpen: true },
        thursday: { open: '09:00', close: '21:00', isOpen: true },
        friday: { open: '09:00', close: '22:00', isOpen: true },
        saturday: { open: '10:00', close: '22:00', isOpen: true },
        sunday: { open: '10:00', close: '20:00', isOpen: true },
      },
      cuisineTypes: ['American', 'Italian'],
      rating: '4.5',
      totalReviews: 125,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: mockRestaurant,
    });
  } catch (error) {
    console.error('Get restaurant profile error:', error);
    res.status(500).json({
      error: 'Failed to get restaurant profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update restaurant profile
router.put('/profile', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    
    const validatedData = updateRestaurantProfileSchema.parse(req.body);
    
    // TODO: Use actual database storage
    // const restaurant = await storage.updateRestaurantProfile(userId, validatedData);
    
    // For now, return mock updated data
    const mockUpdatedRestaurant: RestaurantProfile = {
      id: 'restaurant-1',
      userId,
      ...validatedData,
      rating: '4.5',
      totalReviews: 125,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    } as RestaurantProfile;

    res.json({
      success: true,
      data: mockUpdatedRestaurant,
    });
  } catch (error) {
    console.error('Update restaurant profile error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to update restaurant profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all restaurants (public endpoint)
router.get('/all', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      cuisine, 
      search, 
      sortBy = 'rating',
      sortOrder = 'desc' 
    } = req.query;

    // TODO: Use actual database storage with filtering and pagination
    // const restaurants = await storage.getRestaurants({
    //   page: Number(page),
    //   limit: Number(limit),
    //   cuisine: cuisine as string,
    //   search: search as string,
    //   sortBy: sortBy as string,
    //   sortOrder: sortOrder as 'asc' | 'desc',
    // });

    // For now, return mock data
    const mockRestaurants: RestaurantProfile[] = [
      {
        id: 'restaurant-1',
        userId: 'user-1',
        name: 'Pizza Palace',
        description: 'Authentic Italian pizza',
        logo: 'https://example.com/logo1.jpg',
        coverImage: 'https://example.com/cover1.jpg',
        address: {
          street: '123 Pizza St',
          city: 'Foodtown',
          state: 'CA',
          zipCode: '12345',
        },
        contactInfo: {
          phone: '(555) 123-4567',
          email: 'pizza@palace.com',
        },
        bankDetails: {
          accountName: 'Pizza Palace LLC',
          accountNumber: '1234567890',
          bankName: 'Food Bank',
          routingNumber: '123456789',
        },
        openingHours: {
          monday: { open: '11:00', close: '22:00', isOpen: true },
          tuesday: { open: '11:00', close: '22:00', isOpen: true },
          wednesday: { open: '11:00', close: '22:00', isOpen: true },
          thursday: { open: '11:00', close: '22:00', isOpen: true },
          friday: { open: '11:00', close: '23:00', isOpen: true },
          saturday: { open: '11:00', close: '23:00', isOpen: true },
          sunday: { open: '12:00', close: '21:00', isOpen: true },
        },
        cuisineTypes: ['Italian', 'Pizza'],
        rating: '4.8',
        totalReviews: 245,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: 'restaurant-2',
        userId: 'user-2',
        name: 'Burger Barn',
        description: 'Gourmet burgers and fries',
        logo: 'https://example.com/logo2.jpg',
        coverImage: 'https://example.com/cover2.jpg',
        address: {
          street: '456 Burger Ave',
          city: 'Meatville',
          state: 'TX',
          zipCode: '67890',
        },
        contactInfo: {
          phone: '(555) 987-6543',
          email: 'info@burgerbarn.com',
        },
        bankDetails: {
          accountName: 'Burger Barn Inc',
          accountNumber: '0987654321',
          bankName: 'Meat Bank',
          routingNumber: '987654321',
        },
        openingHours: {
          monday: { open: '10:00', close: '21:00', isOpen: true },
          tuesday: { open: '10:00', close: '21:00', isOpen: true },
          wednesday: { open: '10:00', close: '21:00', isOpen: true },
          thursday: { open: '10:00', close: '21:00', isOpen: true },
          friday: { open: '10:00', close: '22:00', isOpen: true },
          saturday: { open: '10:00', close: '22:00', isOpen: true },
          sunday: { open: '11:00', close: '20:00', isOpen: true },
        },
        cuisineTypes: ['American', 'Burgers'],
        rating: '4.3',
        totalReviews: 189,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      },
    ];

    res.json({
      success: true,
      data: {
        restaurants: mockRestaurants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: mockRestaurants.length,
          totalPages: Math.ceil(mockRestaurants.length / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      error: 'Failed to get restaurants',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get restaurant by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Use actual database storage
    // const restaurant = await storage.getRestaurantById(id);
    
    // For now, return mock data
    const mockRestaurant: RestaurantProfile = {
      id,
      userId: 'user-1',
      name: 'Pizza Palace',
      description: 'Authentic Italian pizza made with fresh ingredients',
      logo: 'https://example.com/logo1.jpg',
      coverImage: 'https://example.com/cover1.jpg',
      address: {
        street: '123 Pizza St',
        city: 'Foodtown',
        state: 'CA',
        zipCode: '12345',
        coordinates: { lat: 37.7749, lng: -122.4194 },
      },
      contactInfo: {
        phone: '(555) 123-4567',
        email: 'pizza@palace.com',
        website: 'https://pizzapalace.com',
      },
      bankDetails: {
        accountName: 'Pizza Palace LLC',
        accountNumber: '1234567890',
        bankName: 'Food Bank',
        routingNumber: '123456789',
      },
      openingHours: {
        monday: { open: '11:00', close: '22:00', isOpen: true },
        tuesday: { open: '11:00', close: '22:00', isOpen: true },
        wednesday: { open: '11:00', close: '22:00', isOpen: true },
        thursday: { open: '11:00', close: '22:00', isOpen: true },
        friday: { open: '11:00', close: '23:00', isOpen: true },
        saturday: { open: '11:00', close: '23:00', isOpen: true },
        sunday: { open: '12:00', close: '21:00', isOpen: true },
      },
      cuisineTypes: ['Italian', 'Pizza'],
      rating: '4.8',
      totalReviews: 245,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: mockRestaurant,
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    res.status(500).json({
      error: 'Failed to get restaurant',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Toggle restaurant active status
router.patch('/profile/status', async (req, res) => {
  try {
    // TODO: Get user ID from authentication middleware
    const userId = req.user?.id || 'temp-user-id';
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'isActive must be a boolean value',
      });
    }

    // TODO: Use actual database storage
    // const restaurant = await storage.updateRestaurantStatus(userId, isActive);
    
    res.json({
      success: true,
      message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Update restaurant status error:', error);
    res.status(500).json({
      error: 'Failed to update restaurant status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;