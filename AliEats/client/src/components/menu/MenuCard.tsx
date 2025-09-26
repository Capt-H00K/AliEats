import React from 'react';
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart }) => {
  const isAvailable = item.available !== false;

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={item.image && item.image.trim() !== '' ? item.image : '/placeholder.png'}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col h-full">
        <h3 className="font-semibold text-lg mb-2" data-testid={`text-item-name-${item.id}`}>
          {item.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3" data-testid={`text-item-description-${item.id}`}>
          {item.description}
        </p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-primary" data-testid={`text-item-price-${item.id}`}>
            ${item.price.toFixed(2)}
          </span>
        </div>
        <Button
          onClick={() => isAvailable && onAddToCart(item)}
          disabled={!isAvailable}
          aria-disabled={!isAvailable}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full flex items-center justify-center"
          data-testid={`button-add-to-cart-${item.id}`}
        >
          <Plus size={16} className="mr-2" />
          {isAvailable ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
};