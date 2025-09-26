import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
// import { seedMenuData } from '@/services/firestore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('customer');

 /* // Seed menu data on first load
  useEffect(() => {
    const hasSeeded = localStorage.getItem('menu-seeded');
    if (!hasSeeded) {
      seedMenuData()
        .then(() => localStorage.setItem('menu-seeded', 'true'))
        .catch(console.error);
    }
  }, []);*/

  // Set activeTab based on user role once user is loaded
  useEffect(() => {
    if (user) {
      setActiveTab(user.role);
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <Router>
      {user && (
        <>
          <Navbar
            activeTab={activeTab}
            onTabChange={(tab) => tab === user.role && setActiveTab(tab)}
          />
          <MobileNav
            activeTab={activeTab}
            onTabChange={(tab) => tab === user.role && setActiveTab(tab)}
            isOpen={mobileNavOpen}
            onToggle={() => setMobileNavOpen(!mobileNavOpen)}
          />
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Auth route */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Role-based protected routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Root route: redirect based on user role */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === 'customer'
                      ? '/customer'
                      : user.role === 'driver'
                      ? '/driver'
                      : '/restaurant'
                  }
                  replace
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
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
