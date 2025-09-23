import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

interface SearchOptions {
  query: string;
  categories?: string[];
  cuisineTypes?: string[];
  priceRange?: [number, number];
  rating?: number;
  sortBy?: string;
  limit?: number;
}

interface SearchResult<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export const useSearch = <T>(
  searchFn: (options: SearchOptions) => Promise<{ data: T[]; total: number }>,
  initialOptions: SearchOptions = { query: '' }
) => {
  const [options, setOptions] = useState<SearchOptions>(initialOptions);
  const [result, setResult] = useState<SearchResult<T>>({
    data: [],
    total: 0,
    isLoading: false,
    error: null,
  });

  const debouncedSearch = useMemo(
    () => debounce(async (searchOptions: SearchOptions) => {
      setResult(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await searchFn(searchOptions);
        setResult({
          data: response.data,
          total: response.total,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Search failed',
        }));
      }
    }, 300),
    [searchFn]
  );

  useEffect(() => {
    debouncedSearch(options);
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [options, debouncedSearch]);

  const updateOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const clearSearch = useCallback(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  return {
    ...result,
    options,
    updateOptions,
    clearSearch,
  };
};

// Specific search hooks for different entities
export const useRestaurantSearch = (initialOptions?: Partial<SearchOptions>) => {
  const searchFn = async (options: SearchOptions) => {
    const params = new URLSearchParams({
      ...(options.query && { search: options.query }),
      ...(options.cuisineTypes?.length && { cuisine: options.cuisineTypes.join(',') }),
      ...(options.sortBy && { sortBy: options.sortBy }),
      ...(options.limit && { limit: options.limit.toString() }),
    });

    const response = await fetch(`/api/restaurants/all?${params}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to search restaurants');
    }

    return {
      data: result.data.restaurants,
      total: result.data.pagination?.total || result.data.restaurants.length,
    };
  };

  return useSearch(searchFn, { query: '', ...initialOptions });
};

export const useMenuItemSearch = (initialOptions?: Partial<SearchOptions>) => {
  const searchFn = async (options: SearchOptions) => {
    if (!options.query) {
      return { data: [], total: 0 };
    }

    const params = new URLSearchParams({
      q: options.query,
      ...(options.categories?.length && { category: options.categories.join(',') }),
      ...(options.priceRange && options.priceRange[0] > 0 && { minPrice: options.priceRange[0].toString() }),
      ...(options.priceRange && options.priceRange[1] < 100 && { maxPrice: options.priceRange[1].toString() }),
      ...(options.limit && { limit: options.limit.toString() }),
    });

    const response = await fetch(`/api/menu/search/all?${params}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to search menu items');
    }

    return {
      data: result.data.results,
      total: result.data.pagination?.total || result.data.results.length,
    };
  };

  return useSearch(searchFn, { query: '', ...initialOptions });
};

// Advanced search with multiple filters
export const useAdvancedSearch = () => {
  const [searchType, setSearchType] = useState<'restaurants' | 'menu_items'>('restaurants');
  const [globalOptions, setGlobalOptions] = useState<SearchOptions>({
    query: '',
    categories: [],
    cuisineTypes: [],
    priceRange: [0, 50],
    rating: 0,
    sortBy: 'relevance',
  });

  const restaurantSearch = useRestaurantSearch(globalOptions);
  const menuItemSearch = useMenuItemSearch(globalOptions);

  const currentSearch = searchType === 'restaurants' ? restaurantSearch : menuItemSearch;

  const updateGlobalOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    setGlobalOptions(prev => ({ ...prev, ...newOptions }));
    
    // Update both search hooks
    restaurantSearch.updateOptions(newOptions);
    menuItemSearch.updateOptions(newOptions);
  }, [restaurantSearch, menuItemSearch]);

  const switchSearchType = useCallback((type: 'restaurants' | 'menu_items') => {
    setSearchType(type);
  }, []);

  const clearAllFilters = useCallback(() => {
    const clearedOptions = {
      query: '',
      categories: [],
      cuisineTypes: [],
      priceRange: [0, 50] as [number, number],
      rating: 0,
      sortBy: 'relevance',
    };
    
    setGlobalOptions(clearedOptions);
    restaurantSearch.updateOptions(clearedOptions);
    menuItemSearch.updateOptions(clearedOptions);
  }, [restaurantSearch, menuItemSearch]);

  return {
    searchType,
    switchSearchType,
    options: globalOptions,
    updateOptions: updateGlobalOptions,
    clearFilters: clearAllFilters,
    restaurants: {
      data: restaurantSearch.data,
      total: restaurantSearch.total,
      isLoading: restaurantSearch.isLoading,
      error: restaurantSearch.error,
    },
    menuItems: {
      data: menuItemSearch.data,
      total: menuItemSearch.total,
      isLoading: menuItemSearch.isLoading,
      error: menuItemSearch.error,
    },
    current: currentSearch,
  };
};

// Search suggestions hook
export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<{
    restaurants: string[];
    menuItems: string[];
    categories: string[];
  }>({
    restaurants: [],
    menuItems: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const debouncedGetSuggestions = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions({ restaurants: [], menuItems: [], categories: [] });
        return;
      }

      setIsLoading(true);
      
      try {
        // TODO: Implement suggestions API endpoint
        // For now, return mock suggestions
        const mockSuggestions = {
          restaurants: [
            'Pizza Palace',
            'Burger Barn',
            'Sushi Station',
          ].filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())),
          menuItems: [
            'Margherita Pizza',
            'Chicken Burger',
            'California Roll',
          ].filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())),
          categories: [
            'Pizza',
            'Burgers',
            'Sushi',
          ].filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())),
        };

        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions({ restaurants: [], menuItems: [], categories: [] });
      } finally {
        setIsLoading(false);
      }
    }, 200),
    []
  );

  useEffect(() => {
    debouncedGetSuggestions(query);
    
    return () => {
      debouncedGetSuggestions.cancel();
    };
  }, [query, debouncedGetSuggestions]);

  return {
    suggestions,
    isLoading,
  };
};

// Recent searches hook
export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(search => search !== query);
      const updated = [query, ...filtered].slice(0, 10); // Keep only 10 recent searches
      
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(search => search !== query);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  };
};