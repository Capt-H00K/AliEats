import React, { useState, useEffect } from 'react';
import { RestaurantProfileForm } from './RestaurantProfileForm';
import { 
  Store, 
  Settings, 
  BarChart3, 
  Menu, 
  Star, 
  Clock, 
  MapPin, 
  Phone,
  Mail,
  Globe,
  Edit,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

interface RestaurantProfile {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  cuisineTypes: string[];
  rating: string;
  totalReviews: number;
  isActive: boolean;
  openingHours: Record<string, { open: string; close: string; isOpen: boolean }>;
}

interface DashboardStats {
  totalOrders: number;
  revenue: number;
  averageRating: number;
  activeMenuItems: number;
}

export const RestaurantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'menu' | 'orders' | 'analytics'>('overview');
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    revenue: 0,
    averageRating: 0,
    activeMenuItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    fetchRestaurantProfile();
    fetchDashboardStats();
  }, []);

  const fetchRestaurantProfile = async () => {
    try {
      const response = await fetch('/api/restaurants/profile');
      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching restaurant profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // TODO: Implement actual stats API
      // For now, use mock data
      setStats({
        totalOrders: 1247,
        revenue: 28450.75,
        averageRating: 4.6,
        activeMenuItems: 42,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleProfileUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/restaurants/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data);
        setIsEditingProfile(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRestaurantStatus = async () => {
    if (!profile) return;

    try {
      const response = await fetch('/api/restaurants/profile/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !profile.isActive }),
      });

      const result = await response.json();
      
      if (result.success) {
        setProfile({ ...profile, isActive: !profile.isActive });
      }
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatOpeningHours = (hours: Record<string, { open: string; close: string; isOpen: boolean }>) => {
    const today = new Date().toLocaleLowerCase().slice(0, 3);
    const todayHours = hours[today + 'day'];
    
    if (!todayHours?.isOpen) {
      return 'Closed today';
    }
    
    return `Open ${todayHours.open} - ${todayHours.close}`;
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Store className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {profile?.name || 'Restaurant Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {profile?.isActive ? (
                    <span className="flex items-center text-green-600">
                      <Eye className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <EyeOff className="w-4 h-4 mr-1" />
                      Inactive
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={toggleRestaurantStatus}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                profile?.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {profile?.isActive ? 'Deactivate' : 'Activate'} Restaurant
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'profile', label: 'Profile', icon: Settings },
              { id: 'menu', label: 'Menu', icon: Menu },
              { id: 'orders', label: 'Orders', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.revenue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalOrders.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Menu className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Menu Items</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.activeMenuItems}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Info Card */}
            {profile && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                  {profile.coverImage && (
                    <img
                      src={profile.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <div className="absolute bottom-4 left-4 flex items-center space-x-4">
                    {profile.logo && (
                      <img
                        src={profile.logo}
                        alt="Logo"
                        className="w-16 h-16 rounded-lg border-2 border-white object-cover"
                      />
                    )}
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                      <p className="text-sm opacity-90">{profile.description}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Address</p>
                        <p className="text-sm text-gray-600">
                          {profile.address.street}<br />
                          {profile.address.city}, {profile.address.state} {profile.address.zipCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact</p>
                        <p className="text-sm text-gray-600">{profile.contactInfo.phone}</p>
                        <p className="text-sm text-gray-600">{profile.contactInfo.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Hours</p>
                        <p className="text-sm text-gray-600">
                          {formatOpeningHours(profile.openingHours)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{profile.rating}</span>
                        <span className="text-sm text-gray-500">({profile.totalReviews} reviews)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.cuisineTypes.map((cuisine) => (
                          <span
                            key={cuisine}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            {isEditingProfile || !profile ? (
              <RestaurantProfileForm
                initialData={profile}
                onSubmit={handleProfileUpdate}
                isLoading={isLoading}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Restaurant Profile</h2>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
                <p className="text-gray-600">
                  Your restaurant profile is complete. Click "Edit Profile" to make changes.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Menu Management</h2>
            <p className="text-gray-600">Menu management features coming soon...</p>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>
            <p className="text-gray-600">Order management features coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600">Analytics features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};