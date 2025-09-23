import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['all', 'restaurants', 'menu_items', 'categories']).optional().default('all'),
  categories: z.string().optional(),
  cuisineTypes: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minRating: z.string().optional(),
  maxDeliveryTime: z.string().optional(),
  sortBy: z.enum(['relevance', 'rating', 'price', 'delivery_time', 'distance']).optional().default('relevance'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  location: z.string().optional(), // lat,lng format
});

const suggestionsQuerySchema = z.object({
  q: z.string().min(1, 'Query is required'),
  limit: z.string().optional().default('10'),
});

// Global search endpoint
router.get('/search', async (req, res) => {
  try {
    const validatedQuery = searchQuerySchema.parse(req.query);
    
    const {
      q: query,
      type,
      categories,
      cuisineTypes,
      minPrice,
      maxPrice,
      minRating,
      maxDeliveryTime,
      sortBy,
      page,
      limit,
      location
    } = validatedQuery;

    // TODO: Implement actual search with database
    // For now, return mock comprehensive search results
    
    const mockResults = {
      restaurants: [
        {
          id: 'restaurant-1',
          name: 'Pizza Palace',
          description: 'Authentic Italian pizza with fresh ingredients',
          logo: 'https://example.com/pizza-logo.jpg',
          coverImage: 'https://example.com/pizza-cover.jpg',
          cuisineTypes: ['Italian', 'Pizza'],
          rating: '4.8',
          totalReviews: 245,
          estimatedDeliveryTime: 25,
          deliveryFee: 2.99,
          minOrderAmount: 15.00,
          address: {
            street: '123 Pizza St',
            city: 'Foodtown',
            state: 'CA',
            zipCode: '12345',
          },
          isOpen: true,
          distance: 1.2, // miles
          relevanceScore: 0.95,
        },
        {
          id: 'restaurant-2',
          name: 'Burger Barn',
          description: 'Gourmet burgers and crispy fries',
          logo: 'https://example.com/burger-logo.jpg',
          coverImage: 'https://example.com/burger-cover.jpg',
          cuisineTypes: ['American', 'Burgers'],
          rating: '4.3',
          totalReviews: 189,
          estimatedDeliveryTime: 20,
          deliveryFee: 3.49,
          minOrderAmount: 12.00,
          address: {
            street: '456 Burger Ave',
            city: 'Meatville',
            state: 'TX',
            zipCode: '67890',
          },
          isOpen: true,
          distance: 2.1,
          relevanceScore: 0.87,
        },
      ],
      menuItems: [
        {
          id: 'menu-1',
          restaurantId: 'restaurant-1',
          restaurantName: 'Pizza Palace',
          restaurantLogo: 'https://example.com/pizza-logo.jpg',
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, tomato sauce, and basil',
          price: '16.99',
          image: 'https://example.com/margherita.jpg',
          categories: [
            { id: 'cat-1', name: 'Pizza' },
            { id: 'cat-2', name: 'Vegetarian' },
          ],
          preparationTime: 20,
          rating: '4.9',
          isAvailable: true,
          relevanceScore: 0.92,
        },
        {
          id: 'menu-2',
          restaurantId: 'restaurant-2',
          restaurantName: 'Burger Barn',
          restaurantLogo: 'https://example.com/burger-logo.jpg',
          name: 'Classic Beef Burger',
          description: 'Juicy beef patty with lettuce, tomato, and special sauce',
          price: '14.99',
          image: 'https://example.com/beef-burger.jpg',
          categories: [
            { id: 'cat-3', name: 'Burgers' },
            { id: 'cat-4', name: 'Beef' },
          ],
          preparationTime: 15,
          rating: '4.5',
          isAvailable: true,
          relevanceScore: 0.88,
        },
      ],
      categories: [
        {
          id: 'cat-1',
          name: 'Pizza',
          description: 'Delicious pizzas with various toppings',
          image: 'https://example.com/pizza-category.jpg',
          itemCount: 45,
          relevanceScore: 0.95,
        },
        {
          id: 'cat-3',
          name: 'Burgers',
          description: 'Gourmet burgers and sandwiches',
          image: 'https://example.com/burger-category.jpg',
          itemCount: 32,
          relevanceScore: 0.89,
        },
      ],
    };

    // Apply filters
    let filteredRestaurants = mockResults.restaurants;
    let filteredMenuItems = mockResults.menuItems;
    let filteredCategories = mockResults.categories;

    // Filter by search query
    const queryLower = query.toLowerCase();
    
    filteredRestaurants = filteredRestaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(queryLower) ||
      restaurant.description.toLowerCase().includes(queryLower) ||
      restaurant.cuisineTypes.some(cuisine => cuisine.toLowerCase().includes(queryLower))
    );

    filteredMenuItems = filteredMenuItems.filter(item =>
      item.name.toLowerCase().includes(queryLower) ||
      item.description.toLowerCase().includes(queryLower) ||
      item.categories.some(cat => cat.name.toLowerCase().includes(queryLower))
    );

    filteredCategories = filteredCategories.filter(category =>
      category.name.toLowerCase().includes(queryLower) ||
      category.description.toLowerCase().includes(queryLower)
    );

    // Apply additional filters
    if (cuisineTypes) {
      const cuisineList = cuisineTypes.split(',');
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.cuisineTypes.some(cuisine => cuisineList.includes(cuisine))
      );
    }

    if (categories) {
      const categoryList = categories.split(',');
      filteredMenuItems = filteredMenuItems.filter(item =>
        item.categories.some(cat => categoryList.includes(cat.name))
      );
    }

    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      filteredMenuItems = filteredMenuItems.filter(item => {
        const price = parseFloat(item.price);
        return price >= min && price <= max;
      });
    }

    if (minRating) {
      const minRatingValue = parseFloat(minRating);
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        parseFloat(restaurant.rating) >= minRatingValue
      );
    }

    if (maxDeliveryTime) {
      const maxTime = parseInt(maxDeliveryTime);
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.estimatedDeliveryTime <= maxTime
      );
    }

    // Sort results
    const sortResults = (items: any[], sortBy: string) => {
      switch (sortBy) {
        case 'rating':
          return items.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
        case 'price':
          return items.sort((a, b) => {
            const aPrice = parseFloat(a.price || a.deliveryFee || '0');
            const bPrice = parseFloat(b.price || b.deliveryFee || '0');
            return aPrice - bPrice;
          });
        case 'delivery_time':
          return items.sort((a, b) => (a.estimatedDeliveryTime || 0) - (b.estimatedDeliveryTime || 0));
        case 'distance':
          return items.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        case 'relevance':
        default:
          return items.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      }
    };

    filteredRestaurants = sortResults(filteredRestaurants, sortBy);
    filteredMenuItems = sortResults(filteredMenuItems, sortBy);
    filteredCategories = sortResults(filteredCategories, sortBy);

    // Prepare response based on type
    let results: any = {};
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (type === 'all' || type === 'restaurants') {
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      results.restaurants = {
        data: filteredRestaurants.slice(startIndex, endIndex),
        total: filteredRestaurants.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredRestaurants.length / limitNum),
      };
    }

    if (type === 'all' || type === 'menu_items') {
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      results.menuItems = {
        data: filteredMenuItems.slice(startIndex, endIndex),
        total: filteredMenuItems.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredMenuItems.length / limitNum),
      };
    }

    if (type === 'all' || type === 'categories') {
      results.categories = {
        data: filteredCategories,
        total: filteredCategories.length,
      };
    }

    // Add search metadata
    const searchMetadata = {
      query,
      type,
      totalResults: (results.restaurants?.total || 0) + 
                   (results.menuItems?.total || 0) + 
                   (results.categories?.total || 0),
      searchTime: Date.now(), // In production, calculate actual search time
      appliedFilters: {
        categories: categories?.split(',') || [],
        cuisineTypes: cuisineTypes?.split(',') || [],
        priceRange: minPrice || maxPrice ? [minPrice || '0', maxPrice || '∞'] : null,
        minRating: minRating ? parseFloat(minRating) : null,
        maxDeliveryTime: maxDeliveryTime ? parseInt(maxDeliveryTime) : null,
      },
    };

    res.json({
      success: true,
      data: results,
      metadata: searchMetadata,
    });
  } catch (error) {
    console.error('Search error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid search parameters',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Search suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit } = suggestionsQuerySchema.parse(req.query);
    const limitNum = parseInt(limit);

    // TODO: Implement actual suggestions with database
    // For now, return mock suggestions
    
    const mockSuggestions = {
      restaurants: [
        'Pizza Palace',
        'Burger Barn',
        'Sushi Station',
        'Taco Time',
        'Pasta Paradise',
      ].filter(name => name.toLowerCase().includes(query.toLowerCase())).slice(0, limitNum),
      
      menuItems: [
        'Margherita Pizza',
        'Pepperoni Pizza',
        'Classic Burger',
        'Chicken Burger',
        'California Roll',
        'Spicy Tuna Roll',
        'Chicken Tacos',
        'Beef Tacos',
        'Spaghetti Carbonara',
        'Fettuccine Alfredo',
      ].filter(name => name.toLowerCase().includes(query.toLowerCase())).slice(0, limitNum),
      
      categories: [
        'Pizza',
        'Burgers',
        'Sushi',
        'Tacos',
        'Pasta',
        'Chinese',
        'Italian',
        'Mexican',
        'Japanese',
        'American',
      ].filter(name => name.toLowerCase().includes(query.toLowerCase())).slice(0, limitNum),
      
      cuisines: [
        'Italian',
        'Chinese',
        'Mexican',
        'Japanese',
        'Indian',
        'Thai',
        'American',
        'Mediterranean',
        'Korean',
        'Vietnamese',
      ].filter(name => name.toLowerCase().includes(query.toLowerCase())).slice(0, limitNum),
    };

    res.json({
      success: true,
      data: mockSuggestions,
      query,
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid suggestion parameters',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to get suggestions',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Popular searches endpoint
router.get('/popular', async (req, res) => {
  try {
    // TODO: Implement actual popular searches tracking
    // For now, return mock popular searches
    
    const mockPopularSearches = {
      overall: [
        { query: 'pizza', count: 1250 },
        { query: 'burgers', count: 980 },
        { query: 'chinese food', count: 875 },
        { query: 'sushi', count: 720 },
        { query: 'italian', count: 650 },
        { query: 'mexican', count: 580 },
        { query: 'thai food', count: 520 },
        { query: 'indian', count: 480 },
      ],
      trending: [
        { query: 'bubble tea', count: 320, trend: '+45%' },
        { query: 'korean bbq', count: 280, trend: '+38%' },
        { query: 'poke bowl', count: 250, trend: '+25%' },
        { query: 'ramen', count: 220, trend: '+22%' },
      ],
      categories: [
        { name: 'Pizza', count: 1250 },
        { name: 'Burgers', count: 980 },
        { name: 'Chinese', count: 875 },
        { name: 'Sushi', count: 720 },
        { name: 'Italian', count: 650 },
      ],
    };

    res.json({
      success: true,
      data: mockPopularSearches,
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      error: 'Failed to get popular searches',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Search analytics endpoint (admin only)
router.get('/analytics', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { period = 'week' } = req.query;
    
    // TODO: Implement actual search analytics
    // For now, return mock analytics
    
    const mockAnalytics = {
      period,
      totalSearches: 15420,
      uniqueSearchers: 8750,
      averageResultsPerSearch: 12.3,
      topSearches: [
        { query: 'pizza', count: 1250, percentage: 8.1 },
        { query: 'burgers', count: 980, percentage: 6.4 },
        { query: 'chinese food', count: 875, percentage: 5.7 },
        { query: 'sushi', count: 720, percentage: 4.7 },
        { query: 'italian', count: 650, percentage: 4.2 },
      ],
      searchTrends: [
        { date: '2024-01-15', searches: 2100 },
        { date: '2024-01-16', searches: 2250 },
        { date: '2024-01-17', searches: 2180 },
        { date: '2024-01-18', searches: 2350 },
        { date: '2024-01-19', searches: 2420 },
        { date: '2024-01-20', searches: 2180 },
        { date: '2024-01-21', searches: 1920 },
      ],
      noResultsQueries: [
        { query: 'vegan pizza', count: 45 },
        { query: 'gluten free pasta', count: 38 },
        { query: 'keto burgers', count: 32 },
      ],
      conversionRate: 0.68, // Percentage of searches that led to orders
    };

    res.json({
      success: true,
      data: mockAnalytics,
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({
      error: 'Failed to get search analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;