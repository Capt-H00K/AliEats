import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Utensils, Truck, Store, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, signOut } = useAuth();

  const tabs = [
    { id: 'customer', label: 'Customer', icon: Utensils },
    { id: 'driver', label: 'Driver', icon: Truck },
    { id: 'restaurant', label: 'Restaurant', icon: Store },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">FlavorFleet</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                      }`}
                      data-testid={`button-tab-${tab.id}`}
                    >
                      <Icon size={16} className="mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  data-testid="button-sign-out"
                >
                  <User size={16} className="mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <button
                onClick={() => onTabChange('auth')}
                className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center"
                data-testid="button-sign-in"
              >
                <User size={16} className="mr-2" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
