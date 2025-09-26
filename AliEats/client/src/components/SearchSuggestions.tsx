import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  MapPin, 
  ShoppingCart, 
  X,
  ArrowUpRight
} from 'lucide-react';
import { useSearchSuggestions, useRecentSearches } from '../hooks/useSearch';

interface SearchSuggestionsProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onQueryChange,
  onSearch,
  placeholder = 'Search restaurants and menu items...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading } = useSearchSuggestions(query);
  const { 
    recentSearches, 
    addRecentSearch, 
    clearRecentSearches, 
    removeRecentSearch 
  } = useRecentSearches();

  // Popular searches (could be fetched from API)
  const popularSearches = [
    'Pizza',
    'Burgers',
    'Chinese Food',
    'Sushi',
    'Italian',
    'Mexican',
  ];

  const allSuggestions = [
    ...suggestions.restaurants.map(name => ({ type: 'restaurant', text: name })),
    ...suggestions.menuItems.map(name => ({ type: 'menu_item', text: name })),
    ...suggestions.categories.map(name => ({ type: 'category', text: name })),
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQueryChange(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      onSearch(searchQuery);
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = allSuggestions.length + recentSearches.length + popularSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          let selectedText = '';
          if (selectedIndex < allSuggestions.length) {
            selectedText = allSuggestions[selectedIndex].text;
          } else if (selectedIndex < allSuggestions.length + recentSearches.length) {
            selectedText = recentSearches[selectedIndex - allSuggestions.length];
          } else {
            selectedText = popularSearches[selectedIndex - allSuggestions.length - recentSearches.length];
          }
          onQueryChange(selectedText);
          handleSearch(selectedText);
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <MapPin className="w-4 h-4 text-gray-400" />;
      case 'menu_item':
        return <ShoppingCart className="w-4 h-4 text-gray-400" />;
      case 'category':
        return <Search className="w-4 h-4 text-gray-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderSuggestionItem = (
    text: string, 
    icon: React.ReactNode, 
    index: number, 
    onRemove?: () => void
  ) => (
    <div
      key={`${text}-${index}`}
      className={`flex items-center justify-between px-4 py-3 cursor-pointer ${
        selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={() => {
        onQueryChange(text);
        handleSearch(text);
      }}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-gray-900">{text}</span>
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search Suggestions */}
          {allSuggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                Suggestions
              </div>
              {allSuggestions.map((suggestion, index) =>
                renderSuggestionItem(
                  suggestion.text,
                  getSuggestionIcon(suggestion.type),
                  index
                )
              )}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b flex items-center justify-between">
                <span>Recent Searches</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-blue-600 hover:text-blue-700 normal-case text-xs"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((search, index) =>
                renderSuggestionItem(
                  search,
                  <Clock className="w-4 h-4 text-gray-400" />,
                  allSuggestions.length + index,
                  () => removeRecentSearch(search)
                )
              )}
            </div>
          )}

          {/* Popular Searches */}
          {query.length === 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                Popular Searches
              </div>
              {popularSearches.map((search, index) =>
                renderSuggestionItem(
                  search,
                  <TrendingUp className="w-4 h-4 text-gray-400" />,
                  allSuggestions.length + recentSearches.length + index
                )
              )}
            </div>
          )}

          {/* Empty State */}
          {query.length > 0 && allSuggestions.length === 0 && !isLoading && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No suggestions found</p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center mx-auto"
              >
                Search for "{query}"
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          )}

          {/* Initial State */}
          {query.length === 0 && recentSearches.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Start typing to search</p>
              <p className="text-gray-400 text-xs mt-1">
                Find restaurants, menu items, and cuisines
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact search bar for headers
export const CompactSearchBar: React.FC<{
  onSearch: (query: string) => void;
  className?: string;
}> = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`p-2 text-gray-400 hover:text-gray-600 ${className}`}
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={`w-64 ${className}`}>
      <SearchSuggestions
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        placeholder="Quick search..."
      />
    </div>
  );
};