import React, { useState } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CustomerDashboard } from '@/pages/customer-dashboard';
import { DriverDashboard } from '@/pages/driver-dashboard';
import { RestaurantDashboard } from '@/pages/restaurant-dashboard';
import { AuthPage } from '@/pages/auth';
import { seedMenuData } from '@/services/firestore';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('customer');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Seed menu data on first load (in a real app, this would be done via admin panel)
  React.useEffect(() => {
    const hasSeeded = localStorage.getItem('menu-seeded');
    if (!hasSeeded) {
      seedMenuData().then(() => {
        localStorage.setItem('menu-seeded', 'true');
      }).catch(console.error);
    }
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar activeTab="auth" onTabChange={() => {}} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AuthPage />
        </main>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (activeTab) {
      case 'customer':
        return <CustomerDashboard />;
      case 'driver':
        return <DriverDashboard />;
      case 'restaurant':
        return <RestaurantDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={mobileNavOpen}
        onToggle={() => setMobileNavOpen(!mobileNavOpen)}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
