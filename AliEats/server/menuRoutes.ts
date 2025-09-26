import { Router } from 'express';
import { z } from 'zod';
import { 
  insertMenuItemSchema, 
  selectMenuItemSchema,
  type MenuItem,
  type InsertMenuItem 
} from '@shared/schema';

const router = Router();

// Validation schemas
const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Menu item name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  image: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  preparationTime: z.number().positive().optional(),
  nutritionInfo: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    allergens: z.array(z.string()).optional(),
  }).optional(),
  isAvailable: z.boolean().optional(),
});

const updateMenuItemSchema = createMenuItemSchema.partial();

// Get menu items for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { 
      category, 
      available = 'true', 
      search,
      page = 1,
      limit = 20 
    } = req.query;

    // TODO: Use actual database storage
    // const menuItems = await storage.getMenuItemsByRestaurant(restaurantId, {
    //   category: category as string,
    //   available: available === 'true',
    //   search: search as string,
    //   page: Number(page),
    //   limit: Number(limit),
    // });

    // For now, return mock data
    const mockMenuItems = [
      {
        id: 'menu-1',
        restaurantId,
        name: 'Grilled Chicken Breast',
        description: 'Tender grilled chicken breast with herbs and spices',
        price: '18.99',
        image: 'https://example.com/grilled-chicken.jpg',
        isAvailable: true,
        preparationTime: 15,
        nutritionInfo: {
          calories: 320,
          protein: 45,
          carbs: 2,
          fat: 12,
          allergens: [],
        },
        categories: [
          { id: 'cat-1', name: 'Chicken' },
          { id: 'cat-5', name: 'Lunch' },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'menu-2',
        restaurantId,
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        price: '14.99',
        image: 'https://example.com/beef-burger.jpg',
        isAvailable: true,
        preparationTime: 12,
        nutritionInfo: {
          calories: 580,
          protein: 32,
          carbs: 45,
          fat: 28,
          allergens: ['gluten', 'dairy'],
        },
        categories: [
          { id: 'cat-2', name: 'Beef' },
          { id: 'cat-3', name: 'Burger' },
          { id: 'cat-5', name: 'Lunch' },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'menu-3',
        restaurantId,
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, and basil',
        price: '16.99',
        image: 'https://example.com/margherita-pizza.jpg',
        isAvailable: true,
        preparationTime: 20,
        nutritionInfo: {
          calories: 450,
          protein: 18,
          carbs: 55,
          fat: 16,
          allergens: ['gluten', 'dairy'],
        },
        categories: [
          { id: 'cat-4', name: 'Pizza' },
          { id: 'cat-9', name: 'Vegetarian' },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'menu-4',
        restaurantId,
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: '8.99',
        image: 'https://example.com/chocolate-cake.jpg',
        isAvailable: true,
        preparationTime: 5,
        nutritionInfo: {
          calories: 420,
          protein: 6,
          carbs: 65,
          fat: 18,
          allergens: ['gluten', 'dairy', 'eggs'],
        },
        categories: [
          { id: 'cat-6', name: 'Dessert' },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'menu-5',
        restaurantId,
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: '4.99',
        image: 'https://example.com/orange-juice.jpg',
        isAvailable: true,
        preparationTime: 2,
        nutritionInfo: {
          calories: 110,
          protein: 2,
          carbs: 26,
          fat: 0,
          allergens: [],
        },
        categories: [
          { id: 'cat-7', name: 'Drinks' },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    let filteredItems = mockMenuItems;

    // Filter by category
    if (category) {
      filteredItems = filteredItems.filter(item => 
        item.categories.some(cat => cat.name.toLowerCase() === (category as string).toLowerCase())
      );
    }

    // Filter by availability
    if (available === 'true') {
      filteredItems = filteredItems.filter(item => item.isAvailable);
    }

    // Filter by search
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredItems.length,
          totalPages: Math.ceil(filteredItems.length / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      error: 'Failed to get menu items',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Use actual database storage
    // const menuItem = await storage.getMenuItemById(id);
    
    // For now, return mock data
    const mockMenuItem = {
      id,
      restaurantId: 'restaurant-1',
      name: 'Grilled Chicken Breast',
      description: 'Tender grilled chicken breast with herbs and spices, served with seasonal vegetables',
      price: '18.99',
      image: 'https://example.com/grilled-chicken.jpg',
      isAvailable: true,
      preparationTime: 15,
      nutritionInfo: {
        calories: 320,
        protein: 45,
        carbs: 2,
        fat: 12,
        allergens: [],
      },
      categories: [
        { id: 'cat-1', name: 'Chicken' },
        { id: 'cat-5', name: 'Lunch' },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    res.json({
      success: true,
      data: mockMenuItem,
    });
  } catch (error) {
    console.error('Get menu item by ID error:', error);
    res.status(500).json({
      error: 'Failed to get menu item',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create menu item (restaurant owner only)
router.post('/', async (req, res) => {
  try {
    // TODO: Get restaurant ID from authenticated user
    const restaurantId = req.user?.restaurantId || 'temp-restaurant-id';
    
    const validatedData = createMenuItemSchema.parse(req.body);
    
    const menuItemData: InsertMenuItem = {
      restaurantId,
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price.toString(),
      image: validatedData.image,
      isAvailable: validatedData.isAvailable ?? true,
      preparationTime: validatedData.preparationTime,
      nutritionInfo: validatedData.nutritionInfo,
    };

    // TODO: Use actual database storage
    // const menuItem = await storage.createMenuItem(menuItemData, validatedData.categoryIds);
    
    // For now, return mock data
    const mockMenuItem = {
      id: 'menu-' + Date.now(),
      ...menuItemData,
      categories: validatedData.categoryIds.map(id => ({ id, name: 'Category' })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: mockMenuItem,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to create menu item',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update menu item (restaurant owner only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateMenuItemSchema.parse(req.body);
    
    // TODO: Verify ownership and use actual database storage
    // const menuItem = await storage.updateMenuItem(id, validatedData);
    
    // For now, return mock updated data
    const mockUpdatedMenuItem = {
      id,
      restaurantId: 'restaurant-1',
      name: validatedData.name || 'Updated Item',
      description: validatedData.description || 'Updated description',
      price: validatedData.price?.toString() || '19.99',
      image: validatedData.image || 'https://example.com/updated.jpg',
      isAvailable: validatedData.isAvailable ?? true,
      preparationTime: validatedData.preparationTime || 15,
      nutritionInfo: validatedData.nutritionInfo,
      categories: validatedData.categoryIds?.map(id => ({ id, name: 'Category' })) || [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: mockUpdatedMenuItem,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to update menu item',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Toggle menu item availability (restaurant owner only)
router.patch('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        error: 'isAvailable must be a boolean value',
      });
    }

    // TODO: Verify ownership and use actual database storage
    // const menuItem = await storage.updateMenuItemAvailability(id, isAvailable);
    
    res.json({
      success: true,
      message: `Menu item ${isAvailable ? 'made available' : 'made unavailable'} successfully`,
    });
  } catch (error) {
    console.error('Update menu item availability error:', error);
    res.status(500).json({
      error: 'Failed to update menu item availability',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete menu item (restaurant owner only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Verify ownership and use actual database storage
    // await storage.deleteMenuItem(id);
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      error: 'Failed to delete menu item',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Search menu items across all restaurants
router.get('/search/all', async (req, res) => {
  try {
    const { 
      q: query, 
      category, 
      minPrice, 
      maxPrice,
      page = 1,
      limit = 20 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required',
      });
    }

    // TODO: Use actual database storage with full-text search
    // const results = await storage.searchMenuItems({
    //   query: query as string,
    //   category: category as string,
    //   minPrice: minPrice ? Number(minPrice) : undefined,
    //   maxPrice: maxPrice ? Number(maxPrice) : undefined,
    //   page: Number(page),
    //   limit: Number(limit),
    // });

    // For now, return mock search results
    const mockResults = [
      {
        id: 'menu-1',
        restaurantId: 'restaurant-1',
        restaurantName: 'Pizza Palace',
        name: 'Grilled Chicken Breast',
        description: 'Tender grilled chicken breast with herbs and spices',
        price: '18.99',
        image: 'https://example.com/grilled-chicken.jpg',
        categories: ['Chicken', 'Lunch'],
        rating: '4.8',
        preparationTime: 15,
      },
      {
        id: 'menu-2',
        restaurantId: 'restaurant-2',
        restaurantName: 'Burger Barn',
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        price: '14.99',
        image: 'https://example.com/beef-burger.jpg',
        categories: ['Beef', 'Burger', 'Lunch'],
        rating: '4.3',
        preparationTime: 12,
      },
    ];

    res.json({
      success: true,
      data: {
        results: mockResults,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: mockResults.length,
          totalPages: Math.ceil(mockResults.length / Number(limit)),
        },
        query: query as string,
      },
    });
  } catch (error) {
    console.error('Search menu items error:', error);
    res.status(500).json({
      error: 'Failed to search menu items',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;