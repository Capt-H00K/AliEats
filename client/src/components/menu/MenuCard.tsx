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
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
      {/* Menu Item Image */}
      <img
        src={item.image && item.image.trim() !== '' ? item.image : '/placeholder.png'}
        alt={item.name}
        className="w-full h-48 object-cover"
      />

      {/* Menu Item Info */}
      <div className="p-4 flex flex-col justify-between h-full">
        <div>
          <h3
            className="font-semibold text-lg mb-2"
            data-testid={`text-item-name-${item.id}`}
          >
            {item.name}
          </h3>
          <p
            className="text-muted-foreground text-sm mb-3"
            data-testid={`text-item-description-${item.id}`}
          >
            {item.description}
          </p>
        </div>

        {/* Price + Add Button */}
        <div className="flex justify-between items-center mt-2">
          <span
            className="text-2xl font-bold text-primary"
            data-testid={`text-item-price-${item.id}`}
          >
            ${item.price.toFixed(2)}
          </span>

          <Button
            onClick={() => isAvailable && onAddToCart(item)}
            disabled={!isAvailable}
            aria-disabled={!isAvailable}
            className={`flex items-center ${
              isAvailable
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            data-testid={`button-add-to-cart-${item.id}`}
          >
            <Plus size={16} className="mr-2" />
            {isAvailable ? 'Add' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
};