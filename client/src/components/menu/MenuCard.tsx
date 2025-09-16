import React from 'react';
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
      {/* Menu Item Image */}
      <img
        src={item.image}
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
            onClick={() => onAddToCart(item)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center"
            data-testid={`button-add-to-cart-${item.id}`}
          >
            <Plus size={16} className="mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
