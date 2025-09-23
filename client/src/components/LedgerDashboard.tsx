import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  driverId: string;
  orderId?: string;
  type: 'earning' | 'fee' | 'settlement' | 'debt';
  amount: string;
  description: string;
  isSettled: boolean;
  settledAt: Date | null;
  metadata?: {
    feeType?: string;
    settlementId?: string;
    notes?: string;
  };
  createdAt: Date;
}

interface DriverBalance {
  driverId: string;
  totalEarnings: number;
  totalFees: number;
  totalDebts: number;
  totalSettlements: number;
  currentBalance: number;
  pendingSettlement: number;
  breakdown: {
    unsettledEarnings: number;
    unsettledFees: number;
    unsettledDebts: number;
    netUnsettled: number;
  };
  lastSettlement?: {
    id: string;
    amount: number;
    date: Date;
  };
}

interface Settlement {
  id: string;
  driverId: string;
  amount: string;
  settledEntries: string[];
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
}

export const LedgerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'entries' | 'settlements'>('overview');
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [balance, setBalance] = useState<DriverBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    settled: 'all',
    dateRange: '7d',
  });

  const driverId = 'driver-1'; // TODO: Get from auth context

  useEffect(() => {
    fetchBalance();
    fetchEntries();
    fetchSettlements();
  }, [filter]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`/api/ledger/balance/${driverId}`);
      const result = await response.json();
      
      if (result.success) {
        setBalance(result.data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams({
        ...(filter.type !== 'all' && { type: filter.type }),
        ...(filter.settled !== 'all' && { settled: filter.settled }),
      });

      const response = await fetch(`/api/ledger/driver/${driverId}?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setEntries(result.data.entries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettlements = async () => {
    try {
      const response = await fetch(`/api/ledger/settlements/${driverId}`);
      const result = await response.json();
      
      if (result.success) {
        setSettlements(result.data.settlements);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'fee':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'settlement':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'debt':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Receipt className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEntryColor = (type: string, amount: string) => {
    const value = parseFloat(amount);
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading && !balance) {
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
          <DollarSign className="w-6 h-6 mr-2" />
          Earnings & Ledger
        </h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Balance Overview */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(balance.currentBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Settlement</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(balance.pendingSettlement)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(balance.totalEarnings)}
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
                <p className="text-sm font-medium text-gray-600">Outstanding Debt</p>
                <p className="text-2xl font-semibold text-red-600">
                  {formatCurrency(Math.abs(balance.totalDebts))}
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
            { id: 'entries', label: 'Ledger Entries' },
            { id: 'settlements', label: 'Settlements' },
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
        {activeTab === 'overview' && balance && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Balance Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Unsettled Items</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Earnings</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(balance.breakdown.unsettledEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fees</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(balance.breakdown.unsettledFees)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debts</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(balance.breakdown.unsettledDebts)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Net Unsettled</span>
                      <span className={balance.breakdown.netUnsettled >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(balance.breakdown.netUnsettled)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Last Settlement</h4>
                {balance.lastSettlement ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{formatCurrency(balance.lastSettlement.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(balance.lastSettlement.date)}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No settlements yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entries' && (
          <div>
            {/* Filters */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="earning">Earnings</option>
                  <option value="fee">Fees</option>
                  <option value="debt">Debts</option>
                  <option value="settlement">Settlements</option>
                </select>

                <select
                  value={filter.settled}
                  onChange={(e) => setFilter({ ...filter, settled: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="true">Settled</option>
                  <option value="false">Unsettled</option>
                </select>

                <select
                  value={filter.dateRange}
                  onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>

            {/* Entries List */}
            <div className="divide-y">
              {entries.map((entry) => (
                <div key={entry.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getEntryIcon(entry.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{entry.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="capitalize">{entry.type}</span>
                        {entry.orderId && (
                          <>
                            <span>•</span>
                            <span>Order #{entry.orderId}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${getEntryColor(entry.type, entry.amount)}`}>
                      {parseFloat(entry.amount) >= 0 ? '+' : ''}{formatCurrency(parseFloat(entry.amount))}
                    </p>
                    <div className="flex items-center text-sm">
                      {entry.isSettled ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Settled
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-600">
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {entries.length === 0 && (
                <div className="p-12 text-center">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
                  <p className="text-gray-600">No ledger entries match your current filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="divide-y">
            {settlements.map((settlement) => (
              <div key={settlement.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Settlement #{settlement.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(settlement.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-green-600">
                      {formatCurrency(parseFloat(settlement.amount))}
                    </p>
                    <p className="text-sm text-gray-600">
                      {settlement.settledEntries.length} entries
                    </p>
                  </div>
                </div>

                {settlement.paymentMethod && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="ml-2 font-medium">{settlement.paymentMethod}</span>
                    </div>
                    {settlement.paymentReference && (
                      <div>
                        <span className="text-gray-600">Reference:</span>
                        <span className="ml-2 font-medium">{settlement.paymentReference}</span>
                      </div>
                    )}
                  </div>
                )}

                {settlement.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {settlement.notes}
                  </div>
                )}
              </div>
            ))}
            
            {settlements.length === 0 && (
              <div className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No settlements yet</h3>
                <p className="text-gray-600">Your settlements will appear here once processed.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};