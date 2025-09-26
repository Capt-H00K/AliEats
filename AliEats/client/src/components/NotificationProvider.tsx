import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications, useNotificationHistory } from '../hooks/useNotifications';

interface NotificationContextType {
  permission: {
    granted: boolean;
    denied: boolean;
    default: boolean;
  };
  deviceToken: string | null;
  unreadCount: number;
  requestPermission: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { 
    permission, 
    deviceToken, 
    requestPermission, 
    isLoading, 
    error 
  } = useNotifications();
  
  const { unreadCount } = useNotificationHistory();

  // Auto-request permission on first visit (optional)
  useEffect(() => {
    // Only auto-request if user hasn't explicitly denied
    if (permission.default && !localStorage.getItem('notification-permission-asked')) {
      // You can uncomment this to auto-request permission
      // requestPermission();
      localStorage.setItem('notification-permission-asked', 'true');
    }
  }, [permission.default, requestPermission]);

  // Update document title with unread count
  useEffect(() => {
    const originalTitle = document.title.replace(/^\(\d+\) /, '');
    
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [unreadCount]);

  // Update favicon with notification badge (optional)
  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && unreadCount > 0) {
      // You can implement favicon badge logic here
      // For now, we'll just change the title
    }
  }, [unreadCount]);

  const contextValue: NotificationContextType = {
    permission,
    deviceToken,
    unreadCount,
    requestPermission,
    isLoading,
    error,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Toast notification component for in-app notifications
interface ToastNotificationProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 max-w-sm w-full border rounded-lg shadow-lg z-50 ${getTypeStyles()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm mt-1">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast manager for showing multiple notifications
export const useToastNotifications = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>>([]);

  const showToast = (
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer,
  };
};