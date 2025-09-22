import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  subscribeToDriverLedgers, 
  subscribeToDriverSettlements,
  LedgerEntry,
  Settlement 
} from '@/services/ledger';
import { DollarSign, Store, Calendar, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export const DriverLedger: React.FC = () => {
  const { user } = useAuth();
  
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribeLedgers = subscribeToDriverLedgers(user.id, (fetchedLedgers) => {
      setLedgers(fetchedLedgers);
      setLoading(false);
    });

    const unsubscribeSettlements = subscribeToDriverSettlements(user.id, (fetchedSettlements) => {
      setSettlements(fetchedSettlements);
    });

    return () => {
      unsubscribeLedgers();
      unsubscribeSettlements();
    };
  }, [user?.id]);

  const totalOwed = ledgers.reduce((sum, ledger) => sum + ledger.totalOwed, 0);
  const totalSettled = settlements.reduce((sum, settlement) => sum + settlement.amount, 0);
  const totalEarnings = totalOwed + totalSettled;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Owed</p>
                <p className="text-2xl font-bold text-red-600">
                  ${totalOwed.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="text-red-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalSettled.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-primary">
                  ${totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Restaurants</p>
                <p className="text-2xl font-bold text-secondary">
                  {ledgers.length}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Store className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Debts by Restaurant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Outstanding Debts by Restaurant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ledgers.filter(ledger => ledger.totalOwed > 0).length > 0 ? (
            <div className="space-y-4">
              {ledgers
                .filter(ledger => ledger.totalOwed > 0)
                .sort((a, b) => b.totalOwed - a.totalOwed)
                .map(ledger => (
                  <div key={ledger.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary/10 p-2 rounded-lg">
                        <Store className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {ledger.restaurantName || `Restaurant ${ledger.restaurantId.slice(0, 8)}...`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Last order: {ledger.lastOrderId}
                        </p>
                        {ledger.updatedAt && (
                          <p className="text-xs text-muted-foreground">
                            Updated: {new Date(ledger.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        ${ledger.totalOwed.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">owed</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground">All settled up! No outstanding debts.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Restaurant Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Restaurant Accounts Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ledgers.length > 0 ? (
            <div className="space-y-4">
              {ledgers
                .sort((a, b) => b.totalOwed - a.totalOwed)
                .map(ledger => {
                  const settledForRestaurant = settlements
                    .filter(s => s.restaurantId === ledger.restaurantId)
                    .reduce((sum, s) => sum + s.amount, 0);
                  
                  return (
                    <div key={ledger.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary/10 p-2 rounded-lg">
                            <Store className="h-4 w-4 text-secondary" />
                          </div>
                          <h4 className="font-semibold">
                            {ledger.restaurantName || `Restaurant ${ledger.restaurantId.slice(0, 8)}...`}
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${ledger.totalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${ledger.totalOwed.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {ledger.totalOwed > 0 ? 'owed' : 'settled'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Paid:</p>
                          <p className="font-medium text-green-600">${settledForRestaurant.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Order:</p>
                          <p className="font-medium">{ledger.lastOrderId}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No restaurant accounts yet. Start accepting orders to see your ledger!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settlements.length > 0 ? (
            <div className="space-y-3">
              {settlements.slice(0, 10).map(settlement => (
                <div key={settlement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Made</p>
                      <p className="text-sm text-muted-foreground">
                        {settlement.settledAt && new Date(settlement.settledAt).toLocaleString()}
                      </p>
                      {settlement.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{settlement.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${settlement.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">paid</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No payments made yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Reminder */}
      {totalOwed > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-800">Payment Reminder</h4>
                <p className="text-red-700 text-sm">
                  You have ${totalOwed.toFixed(2)} in outstanding payments. 
                  Please settle with restaurants before end of business day or as per your agreement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};