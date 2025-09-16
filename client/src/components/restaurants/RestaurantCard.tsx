import React from 'react';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurantId: string) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSelect }) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={restaurant.image} 
        alt={restaurant.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
        <p className="text-muted-foreground text-sm mb-3">{restaurant.description}</p>
        <Button
          onClick={() => onSelect(restaurant.id)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
        >
          View Menu
        </Button>
      </div>
    </div>
  );
};
