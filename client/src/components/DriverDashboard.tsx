import React, { useState, useEffect } from 'react';
import { DriverProfileForm } from './DriverProfileForm';
import { 
  Car, 
  Settings, 
  BarChart3, 
  DollarSign, 
  Star, 
  Clock, 
  MapPin,
  Zap,
  TrendingUp,
  Users,
  Eye,
  EyeOff,
  Edit,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  customFees: {
    deliveryFee: number;
    speedPointFee?: number;
    additionalFees?: Array<{ name: string; amount: number }>;
  };
  isAvailable: boolean;
  rating: string;
  totalDeliveries: number;
  currentDebt: string;
}

interface DriverStats {
  totalDeliveries: number;
  totalEarnings: number;
  currentDebt: number;
  averageRating: number;
  completionRate: number;
  onTimeRate: number;
  thisWeek: {
    deliveries: number;
    earnings: number;
    hours: number;
  };
  thisMonth: {
    deliveries: number;
    earnings: number;
    hours: number;
  };
  recentDeliveries: Array<{
    id: string;
    restaurantName: string;
    customerName: string;
    amount: number;
    fee: number;
    tip: number;
    completedAt: Date;
    rating: number;
  }>;
}

export const DriverDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'fees' | 'earnings' | 'history'>('overview');
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    fetchDriverProfile();
    fetchDriverStats();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      const response = await fetch('/api/drivers/profile');
      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching driver profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDriverStats = async () => {
    try {
      const response = await fetch('/api/drivers/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching driver stats:', error);
    }
  };

  const handleProfileUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/drivers/profile', {
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

  const toggleAvailability = async () => {
    if (!profile) return;

    try {
      const response = await fetch('/api/drivers/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !profile.isAvailable }),
      });

      const result = await response.json();
      
      if (result.success) {
        setProfile({ ...profile, isAvailable: !profile.isAvailable });
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
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
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'Driver Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {profile?.isAvailable ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Available for deliveries
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Unavailable
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                profile?.isAvailable
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {profile?.isAvailable ? 'Go Offline' : 'Go Online'}
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
              { id: 'fees', label: 'Fees', icon: DollarSign },
              { id: 'earnings', label: 'Earnings', icon: TrendingUp },
              { id: 'history', label: 'History', icon: Clock },
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
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.totalEarnings)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalDeliveries.toLocaleString()}
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
                  <div className={`p-2 rounded-lg ${
                    stats.currentDebt > 0 ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <AlertCircle className={`w-6 h-6 ${
                      stats.currentDebt > 0 ? 'text-red-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Current Debt</p>
                    <p className={`text-2xl font-semibold ${
                      stats.currentDebt > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(stats.currentDebt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">This Week</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deliveries</span>
                    <span className="font-semibold">{stats.thisWeek.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Earnings</span>
                    <span className="font-semibold">{formatCurrency(stats.thisWeek.earnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hours</span>
                    <span className="font-semibold">{stats.thisWeek.hours.toFixed(1)}h</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deliveries</span>
                    <span className="font-semibold">{stats.thisMonth.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Earnings</span>
                    <span className="font-semibold">{formatCurrency(stats.thisMonth.earnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hours</span>
                    <span className="font-semibold">{stats.thisMonth.hours.toFixed(1)}h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Deliveries */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Deliveries</h3>
              </div>
              <div className="divide-y">
                {stats.recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{delivery.restaurantName}</p>
                        <p className="text-sm text-gray-600">
                          To: {delivery.customerName} • {formatDate(delivery.completedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(delivery.fee + delivery.tip)}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        {delivery.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            {isEditingProfile || !profile ? (
              <DriverProfileForm
                initialData={profile}
                onSubmit={handleProfileUpdate}
                isLoading={isLoading}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Driver Profile</h2>
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
                    <p className="text-gray-600">License: {profile.licenseNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Vehicle</h3>
                    <p className="text-gray-600">
                      {profile.vehicleInfo.year} {profile.vehicleInfo.make} {profile.vehicleInfo.model}
                    </p>
                    <p className="text-gray-600">
                      {profile.vehicleInfo.color} • {profile.vehicleInfo.licensePlate}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fees' && profile && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6">Custom Delivery Fees</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Base Delivery Fee</p>
                  <p className="text-sm text-gray-600">Standard delivery charge</p>
                </div>
                <span className="text-lg font-semibold">
                  {formatCurrency(profile.customFees.deliveryFee)}
                </span>
              </div>

              {profile.customFees.speedPointFee && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    <div>
                      <p className="font-medium">SpeedPoint Fee</p>
                      <p className="text-sm text-gray-600">Priority delivery charge</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatCurrency(profile.customFees.speedPointFee)}
                  </span>
                </div>
              )}

              {profile.customFees.additionalFees?.map((fee, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{fee.name}</p>
                    <p className="text-sm text-gray-600">Additional fee</p>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatCurrency(fee.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Fees
              </button>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Earnings & Settlements</h2>
            <p className="text-gray-600">Earnings tracking features coming soon...</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery History</h2>
            <p className="text-gray-600">Delivery history features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};