import React from 'react';
import { Restaurant } from '@/types';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';

interface RestaurantListProps {
  restaurants: Restaurant[];
  // also full object
  onSelect: (restaurant: Restaurant) => void;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants, onSelect }) => {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No restaurants available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {restaurants.map(r => (
        <RestaurantCard key={r.id} restaurant={r} onSelect={onSelect} />
      ))}
    </div>
  );
};
