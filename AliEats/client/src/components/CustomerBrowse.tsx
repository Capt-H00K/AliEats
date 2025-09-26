import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign,
  Grid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  Heart,
  ShoppingCart
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  cuisineTypes: string[];
  rating: string;
  totalReviews: number;
  isActive: boolean;
  estimatedDeliveryTime?: number;
  deliveryFee?: number;
  minOrderAmount?: number;
}

interface MenuItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description?: string;
  price: string;
  image?: string;
  categories: Array<{ id: string; name: string }>;
  rating?: string;
  preparationTime?: number;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

interface SearchFilters {
  query: string;
  categories: string[];
  cuisineTypes: string[];
  priceRange: [number, number];
  rating: number;
  deliveryTime: number;
  sortBy: 'relevance' | 'rating' | 'delivery_time' | 'price' | 'distance';
  viewType: 'restaurants' | 'menu_items';
}

export const CustomerBrowse: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    cuisineTypes: [],
    priceRange: [0, 50],
    rating: 0,
    deliveryTime: 60,
    sortBy: 'relevance',
    viewType: 'restaurants',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filters.viewType === 'restaurants') {
      fetchRestaurants();
    } else {
      fetchMenuItems();
    }
  }, [filters]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchCategories(),
        fetchRestaurants(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.query && { search: filters.query }),
        ...(filters.cuisineTypes.length > 0 && { cuisine: filters.cuisineTypes.join(',') }),
        sortBy: filters.sortBy,
      });

      const response = await fetch(`/api/restaurants/all?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setRestaurants(result.data.restaurants);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const params = new URLSearchParams({
        q: filters.query,
        ...(filters.categories.length > 0 && { category: filters.categories.join(',') }),
        ...(filters.priceRange[0] > 0 && { minPrice: filters.priceRange[0].toString() }),
        ...(filters.priceRange[1] < 50 && { maxPrice: filters.priceRange[1].toString() }),
      });

      const response = await fetch(`/api/menu/search/all?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(result.data.results);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants.filter(restaurant => {
      // Rating filter
      if (filters.rating > 0 && parseFloat(restaurant.rating) < filters.rating) {
        return false;
      }

      // Cuisine type filter
      if (filters.cuisineTypes.length > 0) {
        const hasMatchingCuisine = restaurant.cuisineTypes.some(cuisine =>
          filters.cuisineTypes.includes(cuisine)
        );
        if (!hasMatchingCuisine) return false;
      }

      // Delivery time filter
      if (filters.deliveryTime < 60 && restaurant.estimatedDeliveryTime && 
          restaurant.estimatedDeliveryTime > filters.deliveryTime) {
        return false;
      }

      return true;
    });

    // Sort restaurants
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'delivery_time':
        filtered.sort((a, b) => (a.estimatedDeliveryTime || 30) - (b.estimatedDeliveryTime || 30));
        break;
      case 'price':
        filtered.sort((a, b) => (a.deliveryFee || 0) - (b.deliveryFee || 0));
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [restaurants, filters]);

  const filteredMenuItems = useMemo(() => {
    let filtered = menuItems.filter(item => {
      // Price range filter
      const price = parseFloat(item.price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [menuItems, filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const toggleCuisineType = (cuisine: string) => {
    setFilters(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      categories: [],
      cuisineTypes: [],
      priceRange: [0, 50],
      rating: 0,
      deliveryTime: 60,
      sortBy: 'relevance',
      viewType: filters.viewType,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const cuisineTypes = Array.from(new Set(restaurants.flatMap(r => r.cuisineTypes)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Browse Food</h1>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleFilterChange('viewType', 'restaurants')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filters.viewType === 'restaurants'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Restaurants
                </button>
                <button
                  onClick={() => handleFilterChange('viewType', 'menu_items')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filters.viewType === 'menu_items'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Menu Items
                </button>
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={filters.viewType === 'restaurants' ? 'Search restaurants...' : 'Search menu items...'}
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Categories (for menu items) */}
              {filters.viewType === 'menu_items' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuisine Types (for restaurants) */}
              {filters.viewType === 'restaurants' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Types
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cuisineTypes.map((cuisine) => (
                      <label key={cuisine} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.cuisineTypes.includes(cuisine)}
                          onChange={() => toggleCuisineType(cuisine)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range (for menu items) */}
              {filters.viewType === 'menu_items' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>$0</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange('rating', rating)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-2 flex items-center">
                        {Array.from({ length: rating }, (_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="ml-1 text-sm text-gray-700">& up</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === 0}
                      onChange={() => handleFilterChange('rating', 0)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Any rating</span>
                  </label>
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="delivery_time">Delivery Time</option>
                  <option value="price">Price</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filters.viewType === 'restaurants' ? 'Restaurants' : 'Menu Items'}
                </h2>
                <p className="text-gray-600">
                  {filters.viewType === 'restaurants' 
                    ? `${filteredRestaurants.length} restaurants found`
                    : `${filteredMenuItems.length} menu items found`
                  }
                </p>
              </div>
            </div>

            {/* Results Grid/List */}
            {filters.viewType === 'restaurants' ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}>
                      {restaurant.coverImage ? (
                        <img
                          src={restaurant.coverImage}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
                        <button
                          onClick={() => toggleFavorite(restaurant.id)}
                          className={`p-1 rounded-full ${
                            favorites.has(restaurant.id) ? 'text-red-500' : 'text-gray-400'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${favorites.has(restaurant.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      {restaurant.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {restaurant.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span>{restaurant.rating}</span>
                          <span className="ml-1">({restaurant.totalReviews})</span>
                        </div>
                        
                        {restaurant.estimatedDeliveryTime && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{restaurant.estimatedDeliveryTime} min</span>
                          </div>
                        )}
                        
                        {restaurant.deliveryFee !== undefined && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>{formatCurrency(restaurant.deliveryFee)} delivery</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {restaurant.cuisineTypes.slice(0, 3).map((cuisine) => (
                          <span
                            key={cuisine}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {cuisine}
                          </span>
                        ))}
                        {restaurant.cuisineTypes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{restaurant.cuisineTypes.length - 3} more
                          </span>
                        )}
                      </div>

                      <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                        View Menu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={viewMode === 'list' ? 'w-32 flex-shrink-0' : 'h-32'}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.restaurantName}</p>
                        </div>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(parseFloat(item.price))}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.categories.map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        {item.preparationTime && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{item.preparationTime} min</span>
                          </div>
                        )}
                        
                        <button className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {((filters.viewType === 'restaurants' && filteredRestaurants.length === 0) ||
              (filters.viewType === 'menu_items' && filteredMenuItems.length === 0)) && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};