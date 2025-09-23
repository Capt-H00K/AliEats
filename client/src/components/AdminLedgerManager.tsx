import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Plus,
  Settings,
  Calendar
} from 'lucide-react';

interface EarningsSummary {
  period: string;
  totalDrivers: number;
  activeDrivers: number;
  totalEarnings: number;
  totalFees: number;
  totalDebts: number;
  totalSettlements: number;
  pendingSettlements: number;
  topDrivers: Array<{
    driverId: string;
    name: string;
    earnings: number;
    deliveries: number;
    rating: string;
  }>;
  recentActivity: Array<{
    type: string;
    driverId: string;
    driverName: string;
    amount: number;
    timestamp: Date;
  }>;
}

interface DriverSummary {
  driverId: string;
  name: string;
  totalEarnings: number;
  currentBalance: number;
  pendingSettlement: number;
  lastActivity: Date;
  status: 'active' | 'inactive';
}

export const AdminLedgerManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'settlements' | 'reports'>('overview');
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchSummary();
    fetchDrivers();
  }, [selectedPeriod]);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/ledger/summary/all?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      // TODO: Implement driver summary endpoint
      // For now, use mock data
      const mockDrivers: DriverSummary[] = [
        {
          driverId: 'driver-1',
          name: 'John Driver',
          totalEarnings: 2847.50,
          currentBalance: 162.75,
          pendingSettlement: 162.75,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'active',
        },
        {
          driverId: 'driver-2',
          name: 'Jane Delivery',
          totalEarnings: 3124.25,
          currentBalance: 89.50,
          pendingSettlement: 89.50,
          lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
          status: 'active',
        },
        {
          driverId: 'driver-3',
          name: 'Mike Transport',
          totalEarnings: 1956.75,
          currentBalance: 234.00,
          pendingSettlement: 234.00,
          lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'active',
        },
      ];
      
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleAutoSettle = async (driverId: string) => {
    try {
      const response = await fetch(`/api/ledger/auto-settle/${driverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minAmount: 50 }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Settlement processed: ${result.data.message}`);
        fetchDrivers();
        fetchSummary();
      } else {
        alert('Failed to process settlement: ' + result.error);
      }
    } catch (error) {
      console.error('Error processing auto settlement:', error);
      alert('Failed to process settlement');
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

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.driverId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Ledger Management
        </h2>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.activeDrivers}/{summary.totalDrivers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(summary.totalEarnings)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Settlements</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(summary.pendingSettlements)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Settlements</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(summary.totalSettlements)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'drivers', label: 'Driver Balances' },
            { id: 'settlements', label: 'Settlements' },
            { id: 'reports', label: 'Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {activeTab === 'overview' && summary && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Drivers */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Top Performing Drivers</h3>
                <div className="space-y-4">
                  {summary.topDrivers.map((driver, index) => (
                    <div key={driver.driverId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{driver.name}</p>
                          <p className="text-sm text-gray-600">
                            {driver.deliveries} deliveries • ⭐ {driver.rating}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(driver.earnings)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {summary.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border-l-4 border-blue-200 bg-blue-50">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {activity.type === 'settlement' ? (
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.type === 'settlement' ? 'Settlement' : 'Earning'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.driverName} • {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(activity.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div>
            {/* Search and Filters */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Bulk Settlement
                </button>
              </div>
            </div>

            {/* Drivers List */}
            <div className="divide-y">
              {filteredDrivers.map((driver) => (
                <div key={driver.driverId} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      driver.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{driver.name}</p>
                      <p className="text-sm text-gray-600">
                        ID: {driver.driverId} • Last active: {formatDate(driver.lastActivity)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="font-semibold">{formatCurrency(driver.totalEarnings)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Balance</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(driver.currentBalance)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Pending Settlement</p>
                      <p className="font-semibold text-orange-600">
                        {formatCurrency(driver.pendingSettlement)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAutoSettle(driver.driverId)}
                        disabled={driver.pendingSettlement < 50}
                        className={`px-3 py-1 text-sm rounded-md ${
                          driver.pendingSettlement >= 50
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Settle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredDrivers.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
                  <p className="text-gray-600">No drivers match your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Settlement Management</h3>
            <p className="text-gray-600">Settlement management features coming soon...</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Reports</h3>
            <p className="text-gray-600">Financial reporting features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};