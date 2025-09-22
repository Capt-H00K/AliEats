import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  subscribeToRestaurantLedgers, 
  subscribeToRestaurantSettlements,
  recordSettlement,
  LedgerEntry,
  Settlement 
} from '@/services/ledger';
import { DollarSign, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export const RestaurantLedger: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<LedgerEntry | null>(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribeLedgers = subscribeToRestaurantLedgers(user.id, (fetchedLedgers) => {
      setLedgers(fetchedLedgers);
      setLoading(false);
    });

    const unsubscribeSettlements = subscribeToRestaurantSettlements(user.id, (fetchedSettlements) => {
      setSettlements(fetchedSettlements);
    });

    return () => {
      unsubscribeLedgers();
      unsubscribeSettlements();
    };
  }, [user?.id]);

  const handleOpenSettlementModal = (ledger: LedgerEntry) => {
    setSelectedLedger(ledger);
    setSettlementAmount(ledger.totalOwed.toString());
    setSettlementNotes('');
    setIsSettlementModalOpen(true);
  };

  const handleRecordSettlement = async () => {
    if (!selectedLedger || !user?.id) return;

    const amount = parseFloat(settlementAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid settlement amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > selectedLedger.totalOwed) {
      toast({
        title: "Amount Too High",
        description: "Settlement amount cannot exceed the total owed",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await recordSettlement({
        ledgerId: selectedLedger.id,
        driverId: selectedLedger.driverId,
        restaurantId: selectedLedger.restaurantId,
        amount,
        confirmedBy: user.id,
        notes: settlementNotes,
      });

      toast({
        title: "Settlement Recorded",
        description: `Successfully recorded $${amount.toFixed(2)} payment from driver`,
      });

      setIsSettlementModalOpen(false);
      setSelectedLedger(null);
      setSettlementAmount('');
      setSettlementNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record settlement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalOutstanding = ledgers.reduce((sum, ledger) => sum + ledger.totalOwed, 0);
  const totalSettled = settlements.reduce((sum, settlement) => sum + settlement.amount, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  ${totalOutstanding.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="text-red-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Settled</p>
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
                <p className="text-muted-foreground text-sm">Active Drivers</p>
                <p className="text-2xl font-bold text-primary">
                  {ledgers.filter(l => l.totalOwed > 0).length}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <User className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Debts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Outstanding Driver Debts
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {ledger.driverName || `Driver ${ledger.driverId.slice(0, 8)}...`}
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
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          ${ledger.totalOwed.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">owed</p>
                      </div>
                      <Button
                        onClick={() => handleOpenSettlementModal(ledger)}
                        size="sm"
                        variant="outline"
                      >
                        Record Payment
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground">No outstanding debts! All drivers are settled up.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Settlements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Settlements
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
                      <p className="font-medium">Driver Payment Received</p>
                      <p className="text-sm text-muted-foreground">
                        {settlement.settledAt && new Date(settlement.settledAt).toLocaleString()}
                      </p>
                      {settlement.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{settlement.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${settlement.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No settlements recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Settlement Modal */}
      <Modal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        title="Record Driver Payment"
      >
        {selectedLedger && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">
                {selectedLedger.driverName || `Driver ${selectedLedger.driverId.slice(0, 8)}...`}
              </h4>
              <p className="text-sm text-muted-foreground">
                Total Outstanding: <span className="font-bold text-red-600">${selectedLedger.totalOwed.toFixed(2)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Settlement Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={selectedLedger.totalOwed}
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                placeholder="Enter amount received"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Textarea
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                placeholder="Payment method, reference number, etc."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleRecordSettlement}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Recording...' : 'Record Payment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSettlementModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};