import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Bell, 
  Calendar, 
  Filter, 
  BarChart3,
  MessageSquare,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  usageCount: number;
}

interface NotificationCampaign {
  id: string;
  name: string;
  title: string;
  body: string;
  targetAudience: string;
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipientCount: number;
  successCount: number;
  failureCount: number;
}

interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  topTypes: Array<{ type: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    recipientCount: number;
    timestamp: Date;
    status: string;
  }>;
}

export const AdminNotificationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'templates' | 'campaigns' | 'analytics'>('overview');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Send notification form state
  const [sendForm, setSendForm] = useState({
    title: '',
    body: '',
    targetAudience: 'all_customers',
    scheduleAt: '',
    imageUrl: '',
    clickAction: '',
    data: '{}',
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    title: '',
    body: '',
    type: 'general',
  });

  const [isEditingTemplate, setIsEditingTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchTemplates();
    fetchCampaigns();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStats: NotificationStats = {
        totalSent: 15420,
        totalDelivered: 14890,
        totalFailed: 530,
        deliveryRate: 96.6,
        topTypes: [
          { type: 'order_update', count: 8500 },
          { type: 'promotion', count: 3200 },
          { type: 'new_restaurant', count: 1800 },
          { type: 'reminder', count: 1920 },
        ],
        recentActivity: [
          {
            id: '1',
            type: 'order_update',
            title: 'Order #1234 Delivered',
            recipientCount: 1,
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            status: 'delivered',
          },
          {
            id: '2',
            type: 'promotion',
            title: 'Weekend Special Offer',
            recipientCount: 2500,
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            status: 'delivered',
          },
        ],
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTemplates: NotificationTemplate[] = [
        {
          id: '1',
          name: 'Order Confirmation',
          title: 'Order Confirmed! 🎉',
          body: 'Your order #{orderId} from {restaurantName} has been confirmed.',
          type: 'order_update',
          isActive: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          usageCount: 1250,
        },
        {
          id: '2',
          name: 'Promotion Alert',
          title: '🎉 Special Offer!',
          body: 'Get {discount}% off your next order from {restaurantName}!',
          type: 'promotion',
          isActive: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          usageCount: 850,
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCampaigns: NotificationCampaign[] = [
        {
          id: '1',
          name: 'Weekend Promotion',
          title: '🎉 Weekend Special!',
          body: 'Get 25% off all orders this weekend. Use code WEEKEND25',
          targetAudience: 'active_customers',
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: 'scheduled',
          recipientCount: 5000,
          successCount: 0,
          failureCount: 0,
        },
        {
          id: '2',
          name: 'New Restaurant Launch',
          title: 'New Restaurant Alert! 🍽️',
          body: 'Sushi Station is now delivering in your area!',
          targetAudience: 'location_based',
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'sent',
          recipientCount: 1200,
          successCount: 1150,
          failureCount: 50,
        },
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: sendForm.title,
          body: sendForm.body,
          userIds: ['all'], // This would be replaced with actual user targeting
          imageUrl: sendForm.imageUrl || undefined,
          clickAction: sendForm.clickAction || undefined,
          data: sendForm.data ? JSON.parse(sendForm.data) : undefined,
          scheduleAt: sendForm.scheduleAt || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Notification sent successfully!');
        setSendForm({
          title: '',
          body: '',
          targetAudience: 'all_customers',
          scheduleAt: '',
          imageUrl: '',
          clickAction: '',
          data: '{}',
        });
        fetchStats();
        fetchCampaigns();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Mock save - replace with actual API call
      const newTemplate: NotificationTemplate = {
        id: Date.now().toString(),
        name: templateForm.name,
        title: templateForm.title,
        body: templateForm.body,
        type: templateForm.type,
        isActive: true,
        createdAt: new Date(),
        usageCount: 0,
      };

      if (isEditingTemplate) {
        setTemplates(prev => prev.map(t => 
          t.id === isEditingTemplate ? { ...newTemplate, id: isEditingTemplate } : t
        ));
        setIsEditingTemplate(null);
      } else {
        setTemplates(prev => [...prev, newTemplate]);
      }

      setTemplateForm({
        name: '',
        title: '',
        body: '',
        type: 'general',
      });

      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setTemplateForm({
      name: template.name,
      title: template.title,
      body: template.body,
      type: template.type,
    });
    setIsEditingTemplate(template.id);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      alert('Template deleted successfully!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Bell className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Notification Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'send', label: 'Send Notification', icon: Send },
              { id: 'templates', label: 'Templates', icon: MessageSquare },
              { id: 'campaigns', label: 'Campaigns', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalSent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalDelivered.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalFailed.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.deliveryRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
              <div className="divide-y">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(activity.status)}
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">
                          {activity.recipientCount} recipients • {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6">Send Notification</h2>
            
            <form onSubmit={handleSendNotification} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={sendForm.title}
                    onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notification title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={sendForm.targetAudience}
                    onChange={(e) => setSendForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all_customers">All Customers</option>
                    <option value="active_customers">Active Customers</option>
                    <option value="new_customers">New Customers</option>
                    <option value="location_based">Location Based</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={sendForm.body}
                  onChange={(e) => setSendForm(prev => ({ ...prev, body: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notification message"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={sendForm.imageUrl}
                    onChange={(e) => setSendForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Click Action URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={sendForm.clickAction}
                    onChange={(e) => setSendForm(prev => ({ ...prev, clickAction: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/promotions"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={sendForm.scheduleAt}
                  onChange={(e) => setSendForm(prev => ({ ...prev, scheduleAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Sending...' : 'Send Notification'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Template Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6">
                {isEditingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Template name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="order_update">Order Update</option>
                      <option value="promotion">Promotion</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Template title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body *
                  </label>
                  <textarea
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Template body (use {variable} for dynamic content)"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  {isEditingTemplate && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingTemplate(null);
                        setTemplateForm({ name: '', title: '', body: '', type: 'general' });
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isEditingTemplate ? 'Update' : 'Create'} Template</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Templates List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Templates</h3>
              </div>
              <div className="divide-y">
                {templates.map((template) => (
                  <div key={template.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {template.type}
                          </span>
                          {template.isActive && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-1">{template.title}</p>
                        <p className="text-sm text-gray-600 mb-2">{template.body}</p>
                        <p className="text-xs text-gray-500">
                          Used {template.usageCount} times • Created {template.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Edit template"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Campaigns</h2>
            </div>
            <div className="divide-y">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                        {getStatusIcon(campaign.status)}
                        <span className="text-sm text-gray-600 capitalize">{campaign.status}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">{campaign.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{campaign.body}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Target: {campaign.targetAudience}</span>
                        <span>Recipients: {campaign.recipientCount}</span>
                        {campaign.status === 'sent' && (
                          <>
                            <span>Success: {campaign.successCount}</span>
                            <span>Failed: {campaign.failureCount}</span>
                          </>
                        )}
                        {campaign.scheduledAt && (
                          <span>Scheduled: {campaign.scheduledAt.toLocaleString()}</span>
                        )}
                        {campaign.sentAt && (
                          <span>Sent: {campaign.sentAt.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600">Detailed analytics features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};