import React, { useState, useEffect } from 'react';
import { MenuItem, CartItem, Restaurant } from '@/types';
import { getMenuItems } from '@/services/realtime';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MenuCard } from '@/components/menu/MenuCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuListProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const MenuList: React.FC<MenuListProps> = ({ restaurant, menuItems, setMenuItems, cart, setCart }) => {
  const { toast } = useToast();
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadingMenu, setLoadingMenu] = useState(false);

  const categories = ['All', 'Pizza', 'Burgers', 'Salads', 'Pasta', 'Mexican', 'Vegetarian'];

  useEffect(() => {
    const loadMenu = async () => {
      setLoadingMenu(true);
      try {
        const items = await getMenuItems(restaurant.id);
        setMenuItems(items);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load menu items", variant: "destructive" });
      } finally {
        setLoadingMenu(false);
      }
    };

    if (menuItems.length === 0) loadMenu();
  }, [restaurant.id, menuItems.length, setMenuItems, toast]);

  useEffect(() => {
    let filtered = menuItems;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]);

  const addToCart = (menuItem: MenuItem) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.menuItem.id === menuItem.id);
      if (existing) return prevCart.map(item => item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prevCart, { menuItem, quantity: 1 }];
    });

    toast({ title: "Added to cart", description: `${menuItem.name} has been added` });
  };

  if (loadingMenu) return <LoadingSpinner />;

  return (
    <>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for dishes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <MenuCard key={item.id} item={item} onAddToCart={addToCart} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No items found matching your search criteria.
          </div>
        )}
      </div>
    </>
  );
};
