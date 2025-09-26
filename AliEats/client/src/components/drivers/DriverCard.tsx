import React from 'react';
import { User } from '@/types';
import { Star, MapPin } from 'lucide-react';

interface DriverCardProps {
  driver: User;
  rating?: number;
  totalDeliveries?: number;
}

export const DriverCard: React.FC<DriverCardProps> = ({ 
  driver, 
  rating = 4.8, 
  totalDeliveries = 0 
}) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <div className="flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <MapPin className="text-primary" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg" data-testid={`text-driver-name-${driver.id}`}>
            {driver.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star size={14} className="mr-1 text-yellow-500 fill-current" />
              <span data-testid={`text-driver-rating-${driver.id}`}>{rating}</span>
            </div>
            <span data-testid={`text-driver-deliveries-${driver.id}`}>
              {totalDeliveries} deliveries
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
