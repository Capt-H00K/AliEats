import { Router } from 'express';
import { z } from 'zod';
import { 
  insertCategorySchema, 
  selectCategorySchema,
  type Category,
  type InsertCategory 
} from '@shared/schema';

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { active = 'true' } = req.query;
    
    // TODO: Use actual database storage
    // const categories = await storage.getCategories({ active: active === 'true' });
    
    // For now, return mock data
    const mockCategories: Category[] = [
      {
        id: 'cat-1',
        name: 'Chicken',
        description: 'Delicious chicken dishes',
        image: 'https://example.com/chicken.jpg',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-2',
        name: 'Beef',
        description: 'Premium beef selections',
        image: 'https://example.com/beef.jpg',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-3',
        name: 'Burger',
        description: 'Gourmet burgers',
        image: 'https://example.com/burger.jpg',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-4',
        name: 'Pizza',
        description: 'Fresh baked pizzas',
        image: 'https://example.com/pizza.jpg',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-5',
        name: 'Lunch',
        description: 'Lunch specials',
        image: 'https://example.com/lunch.jpg',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-6',
        name: 'Dessert',
        description: 'Sweet treats',
        image: 'https://example.com/dessert.jpg',
        isActive: true,
        sortOrder: 6,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-7',
        name: 'Drinks',
        description: 'Beverages and refreshments',
        image: 'https://example.com/drinks.jpg',
        isActive: true,
        sortOrder: 7,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-8',
        name: 'Seafood',
        description: 'Fresh seafood dishes',
        image: 'https://example.com/seafood.jpg',
        isActive: true,
        sortOrder: 8,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-9',
        name: 'Vegetarian',
        description: 'Plant-based options',
        image: 'https://example.com/vegetarian.jpg',
        isActive: true,
        sortOrder: 9,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'cat-10',
        name: 'Breakfast',
        description: 'Morning favorites',
        image: 'https://example.com/breakfast.jpg',
        isActive: true,
        sortOrder: 10,
        createdAt: new Date('2024-01-01'),
      },
    ];

    const filteredCategories = active === 'true' 
      ? mockCategories.filter(cat => cat.isActive)
      : mockCategories;

    res.json({
      success: true,
      data: filteredCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to get categories',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Use actual database storage
    // const category = await storage.getCategoryById(id);
    
    // For now, return mock data
    const mockCategory: Category = {
      id,
      name: 'Chicken',
      description: 'Delicious chicken dishes including grilled, fried, and roasted options',
      image: 'https://example.com/chicken.jpg',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
    };

    res.json({
      success: true,
      data: mockCategory,
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      error: 'Failed to get category',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create new category (admin only)
router.post('/', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const validatedData = createCategorySchema.parse(req.body);
    
    const categoryData: InsertCategory = {
      ...validatedData,
      isActive: true,
    };

    // TODO: Use actual database storage
    // const category = await storage.createCategory(categoryData);
    
    // For now, return mock data
    const mockCategory: Category = {
      id: 'cat-' + Date.now(),
      ...categoryData,
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: mockCategory,
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to create category',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update category (admin only)
router.put('/:id', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);
    
    // TODO: Use actual database storage
    // const category = await storage.updateCategory(id, validatedData);
    
    // For now, return mock updated data
    const mockUpdatedCategory: Category = {
      id,
      name: validatedData.name || 'Updated Category',
      description: validatedData.description || 'Updated description',
      image: validatedData.image || 'https://example.com/updated.jpg',
      isActive: true,
      sortOrder: validatedData.sortOrder || 0,
      createdAt: new Date('2024-01-01'),
    };

    res.json({
      success: true,
      data: mockUpdatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to update category',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Toggle category active status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'isActive must be a boolean value',
      });
    }

    // TODO: Use actual database storage
    // const category = await storage.updateCategoryStatus(id, isActive);
    
    res.json({
      success: true,
      message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Update category status error:', error);
    res.status(500).json({
      error: 'Failed to update category status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete category (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;
    
    // TODO: Use actual database storage
    // Check if category is used by any menu items
    // const isUsed = await storage.isCategoryUsed(id);
    // if (isUsed) {
    //   return res.status(400).json({
    //     error: 'Cannot delete category that is being used by menu items',
    //   });
    // }
    
    // await storage.deleteCategory(id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      error: 'Failed to delete category',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Reorder categories (admin only)
router.patch('/reorder', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { categoryIds } = req.body;
    
    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({
        error: 'categoryIds must be an array',
      });
    }

    // TODO: Use actual database storage
    // await storage.reorderCategories(categoryIds);
    
    res.json({
      success: true,
      message: 'Categories reordered successfully',
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      error: 'Failed to reorder categories',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;