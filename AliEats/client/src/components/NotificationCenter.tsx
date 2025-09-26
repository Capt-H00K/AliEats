import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Check, 
  CheckCheck, 
  X,
  Clock,
  Package,
  Gift,
  Star,
  MapPin,
  AlertCircle,
  Filter
} from 'lucide-react';
import { useNotifications, useNotificationHistory, useNotificationPreferences } from '../hooks/useNotifications';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [filterType, setFilterType] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { permission, requestPermission, isLoading: permissionLoading } = useNotifications();
  const { 
    notifications, 
    unreadCount, 
    isLoading: historyLoading, 
    fetchHistory, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationHistory();
  const { 
    preferences, 
    updatePreferences, 
    isLoading: preferencesLoading 
  } = useNotificationPreferences();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'promotion':
        return <Gift className="w-4 h-4 text-green-500" />;
      case 'new_restaurant':
        return <MapPin className="w-4 h-4 text-purple-500" />;
      case 'loyalty_points':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filterType);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Handle click action if available
    if (notification.data?.clickAction) {
      window.open(notification.data.clickAction, '_blank');
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        {permission.granted ? (
          <Bell className="w-6 h-6" />
        ) : (
          <BellOff className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveTab(activeTab === 'notifications' ? 'preferences' : 'notifications')}
                  className="text-gray-500 hover:text-gray-700"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex mt-3 space-x-1">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === 'preferences'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Preferences
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'notifications' ? (
              <>
                {/* Permission Request */}
                {!permission.granted && (
                  <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-yellow-800">
                          Enable notifications to stay updated on your orders and promotions.
                        </p>
                        <button
                          onClick={requestPermission}
                          disabled={permissionLoading}
                          className="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                        >
                          {permissionLoading ? 'Requesting...' : 'Enable Notifications'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All notifications</option>
                      <option value="order_update">Order updates</option>
                      <option value="promotion">Promotions</option>
                      <option value="new_restaurant">New restaurants</option>
                      <option value="loyalty_points">Loyalty points</option>
                      <option value="reminder">Reminders</option>
                    </select>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-gray-200">
                  {historyLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                  ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm ${
                                  !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-800'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.body}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">No notifications</h3>
                      <p className="text-sm text-gray-500">
                        {filterType === 'all' 
                          ? "You're all caught up! New notifications will appear here."
                          : `No ${filterType.replace('_', ' ')} notifications found.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Preferences Tab */
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Notification Types</h4>
                  
                  <label className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Order Updates</p>
                        <p className="text-xs text-gray-500">Status changes, delivery updates</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdates}
                      onChange={(e) => handlePreferenceChange('orderUpdates', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Gift className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Promotions</p>
                        <p className="text-xs text-gray-500">Special offers, discounts</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.promotions}
                      onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">New Restaurants</p>
                        <p className="text-xs text-gray-500">New restaurants in your area</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.newRestaurants}
                      onChange={(e) => handlePreferenceChange('newRestaurants', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Marketing</p>
                        <p className="text-xs text-gray-500">General marketing messages</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                {preferencesLoading && (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'notifications' && filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => fetchHistory(1, filterType === 'all' ? undefined : filterType)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Load more notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact notification badge for headers
export const NotificationBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { unreadCount } = useNotificationHistory();
  const { permission } = useNotifications();

  if (!permission.granted || unreadCount === 0) return null;

  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};