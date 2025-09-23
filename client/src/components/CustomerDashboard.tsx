import React, { useState, useEffect } from 'react';
import { CustomerProfileForm } from './CustomerProfileForm';
import { 
  User, 
  Settings, 
  Clock, 
  Heart, 
  Star, 
  MapPin, 
  Gift,
  CreditCard,
  Bell,
  Edit,
  Package,
  Award
} from 'lucide-react';

interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  loyaltyPoints: number;
  totalOrders: number;
  addresses: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  preferences: {
    cuisineTypes: string[];
    dietaryRestrictions: string[];
    spiceLevel: string;
  };
}

interface Order {
  id: string;
  restaurantName: string;
  restaurantLogo: string;
  status: string;
  total: string;
  orderDate: Date;
  rating?: number;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
}

interface Favorite {
  restaurants: Array<{
    id: string;
    name: string;
    logo: string;
    rating: string;
    cuisineTypes: string[];
  }>;
  menuItems: Array<{
    id: string;
    restaurantName: string;
    name: string;
    price: string;
    image: string;
  }>;
}

export const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'orders' | 'favorites' | 'loyalty'>('overview');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite>({ restaurants: [], menuItems: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchRecentOrders();
    fetchFavorites();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/customers/profile');
      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/customers/orders?limit=5');
      const result = await response.json();
      
      if (result.success) {
        setRecentOrders(result.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/customers/favorites');
      const result = await response.json();
      
      if (result.success) {
        setFavorites(result.data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleProfileUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/customers/profile', {
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

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'preparing':
        return 'text-yellow-600 bg-yellow-100';
      case 'on_the_way':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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
              <div className="relative">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'My Account'}
                </h1>
                <p className="text-sm text-gray-500">
                  {profile?.loyaltyPoints} loyalty points • {profile?.totalOrders} orders
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'profile', label: 'Profile', icon: Settings },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'loyalty', label: 'Loyalty', icon: Award },
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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {profile?.totalOrders || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {profile?.loyaltyPoints || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Favorites</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {favorites.restaurants.length + favorites.menuItems.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="divide-y">
                {recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={order.restaurantLogo}
                        alt={order.restaurantName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{order.restaurantName}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} items • {formatDate(order.orderDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                
                {recentOrders.length === 0 && (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Start browsing restaurants to place your first order!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Favorite Restaurants */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Favorite Restaurants</h3>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="p-6">
                {favorites.restaurants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.restaurants.slice(0, 3).map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <img
                          src={restaurant.logo}
                          alt={restaurant.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{restaurant.name}</p>
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span>{restaurant.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No favorite restaurants yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            {isEditingProfile || !profile ? (
              <CustomerProfileForm
                initialData={profile}
                onSubmit={handleProfileUpdate}
                isLoading={isLoading}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                    <p className="text-gray-600">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-gray-600">{profile.email}</p>
                    <p className="text-gray-600">{profile.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Default Address</h3>
                    {profile.addresses.find(addr => addr.isDefault) ? (
                      <div className="text-gray-600">
                        <p>{profile.addresses.find(addr => addr.isDefault)?.street}</p>
                        <p>
                          {profile.addresses.find(addr => addr.isDefault)?.city}, {' '}
                          {profile.addresses.find(addr => addr.isDefault)?.state} {' '}
                          {profile.addresses.find(addr => addr.isDefault)?.zipCode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No default address set</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Food Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences.cuisineTypes.map((cuisine) => (
                      <span
                        key={cuisine}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {cuisine}
                      </span>
                    ))}
                    {profile.preferences.dietaryRestrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                      >
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Order History</h2>
            <p className="text-gray-600">Order history features coming soon...</p>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Favorites</h2>
            <p className="text-gray-600">Favorites management features coming soon...</p>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Loyalty Program</h2>
            <p className="text-gray-600">Loyalty program features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};