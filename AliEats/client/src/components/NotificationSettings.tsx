import React, { useState } from 'react';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Save, 
  Loader2,
  Package,
  Gift,
  MapPin,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useNotifications, useNotificationPreferences, useTestNotifications } from '../hooks/useNotifications';

export const NotificationSettings: React.FC = () => {
  const [testType, setTestType] = useState('order_placed');
  const [showTestSection, setShowTestSection] = useState(false);

  const { 
    permission, 
    deviceToken, 
    requestPermission, 
    unregisterDevice,
    isLoading: permissionLoading,
    error: permissionError 
  } = useNotifications();

  const { 
    preferences, 
    updatePreferences, 
    isLoading: preferencesLoading,
    error: preferencesError 
  } = useNotificationPreferences();

  const { 
    sendTestNotification, 
    isLoading: testLoading,
    error: testError 
  } = useTestNotifications();

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    const success = await updatePreferences({ [key]: value });
    if (success) {
      setSaveMessage('Preferences saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleTestNotification = async () => {
    if (!deviceToken) {
      alert('Device token not available. Please enable notifications first.');
      return;
    }

    const success = await sendTestNotification(deviceToken, testType);
    if (success) {
      alert('Test notification sent! Check your notifications.');
    }
  };

  const handleDisableNotifications = async () => {
    if (window.confirm('Are you sure you want to disable all notifications? You can re-enable them later.')) {
      const success = await unregisterDevice();
      if (success) {
        alert('Notifications have been disabled.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        </div>

        {/* Permission Status */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Permission Status</h2>
          
          <div className={`p-4 rounded-lg border ${
            permission.granted 
              ? 'bg-green-50 border-green-200' 
              : permission.denied 
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3">
              {permission.granted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : permission.denied ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              
              <div className="flex-1">
                <p className={`font-medium ${
                  permission.granted 
                    ? 'text-green-800' 
                    : permission.denied 
                      ? 'text-red-800'
                      : 'text-yellow-800'
                }`}>
                  {permission.granted 
                    ? 'Notifications Enabled' 
                    : permission.denied 
                      ? 'Notifications Blocked'
                      : 'Notifications Not Enabled'
                  }
                </p>
                <p className={`text-sm ${
                  permission.granted 
                    ? 'text-green-600' 
                    : permission.denied 
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}>
                  {permission.granted 
                    ? 'You will receive push notifications for order updates and promotions.' 
                    : permission.denied 
                      ? 'Notifications are blocked. Please enable them in your browser settings.'
                      : 'Enable notifications to stay updated on your orders and special offers.'
                  }
                </p>
              </div>

              <div className="flex space-x-2">
                {!permission.granted && !permission.denied && (
                  <button
                    onClick={requestPermission}
                    disabled={permissionLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {permissionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    <span>{permissionLoading ? 'Requesting...' : 'Enable Notifications'}</span>
                  </button>
                )}

                {permission.granted && (
                  <button
                    onClick={handleDisableNotifications}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
                  >
                    <BellOff className="w-4 h-4" />
                    <span>Disable</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {permissionError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{permissionError}</p>
            </div>
          )}
        </div>

        {/* Device Information */}
        {permission.granted && deviceToken && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Web Browser</p>
                  <p className="text-sm text-gray-600">Notifications enabled for this device</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded border">
                Device Token: {deviceToken.slice(0, 20)}...{deviceToken.slice(-10)}
              </div>
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        {permission.granted && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notification Types</h2>
              {saveMessage && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{saveMessage}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Package className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Order Updates</h3>
                    <p className="text-sm text-gray-600">
                      Get notified when your order status changes (confirmed, preparing, on the way, delivered)
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.orderUpdates}
                    onChange={(e) => handlePreferenceChange('orderUpdates', e.target.checked)}
                    className="sr-only peer"
                    disabled={preferencesLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Gift className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Promotions & Offers</h3>
                    <p className="text-sm text-gray-600">
                      Receive notifications about special deals, discounts, and promotional campaigns
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                    className="sr-only peer"
                    disabled={preferencesLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <MapPin className="w-6 h-6 text-purple-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">New Restaurants</h3>
                    <p className="text-sm text-gray-600">
                      Get notified when new restaurants start delivering in your area
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.newRestaurants}
                    onChange={(e) => handlePreferenceChange('newRestaurants', e.target.checked)}
                    className="sr-only peer"
                    disabled={preferencesLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Marketing Messages</h3>
                    <p className="text-sm text-gray-600">
                      Receive general marketing messages and app updates
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                    className="sr-only peer"
                    disabled={preferencesLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {preferencesError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{preferencesError}</p>
              </div>
            )}

            {preferencesLoading && (
              <div className="mt-4 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Saving preferences...</span>
              </div>
            )}
          </div>
        )}

        {/* Test Notifications (Development) */}
        {permission.granted && process.env.NODE_ENV === 'development' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Test Notifications</h2>
              <button
                onClick={() => setShowTestSection(!showTestSection)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showTestSection ? 'Hide' : 'Show'} Test Section
              </button>
            </div>

            {showTestSection && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-medium">
                    Development Mode - Test Notifications
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="order_placed">Order Placed</option>
                    <option value="order_delivered">Order Delivered</option>
                    <option value="promotion">Promotion</option>
                    <option value="new_restaurant">New Restaurant</option>
                  </select>
                  
                  <button
                    onClick={handleTestNotification}
                    disabled={testLoading || !deviceToken}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {testLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    <span>{testLoading ? 'Sending...' : 'Send Test'}</span>
                  </button>
                </div>

                {testError && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{testError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Browser Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Browser Notification Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure notifications are enabled in your browser settings</li>
            <li>• Notifications may not work in incognito/private browsing mode</li>
            <li>• You can customize notification sounds in your browser settings</li>
            <li>• Notifications will appear even when the AliceEats tab is not active</li>
          </ul>
        </div>
      </div>
    </div>
  );
};