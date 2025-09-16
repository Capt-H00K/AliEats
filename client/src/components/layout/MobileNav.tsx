import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Utensils, Truck, Store, User } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  onToggle 
}) => {
  const { user, signOut } = useAuth();

  const allTabs = [
    { id: 'customer', label: 'Customer Dashboard', icon: Utensils },
    { id: 'driver', label: 'Driver Dashboard', icon: Truck },
    { id: 'restaurant', label: 'Restaurant Dashboard', icon: Store },
  ];

  // Filter tabs based on user role
  const tabs = user ? allTabs.filter(tab => tab.id === user.role) : [];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onToggle();
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={onToggle}
          className="bg-card p-3 rounded-lg shadow-lg border border-border"
          data-testid="button-mobile-menu-toggle"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-xl">
            <div className="p-4 border-b border-border">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary">FlavorFleet</h1>
                <button
                  onClick={onToggle}
                  className="p-2"
                  data-testid="button-mobile-menu-close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {user ? (
                <>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                        }`}
                        data-testid={`button-mobile-tab-${tab.id}`}
                      >
                        <Icon size={20} className="mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full mt-4"
                    data-testid="button-mobile-sign-out"
                  >
                    <User size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <button
                  onClick={() => handleTabChange('auth')}
                  className="w-full text-left px-4 py-3 rounded-lg font-medium bg-primary text-primary-foreground flex items-center"
                  data-testid="button-mobile-sign-in"
                >
                  <User size={20} className="mr-3" />
                  Authentication
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
