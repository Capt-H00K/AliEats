import { database } from "@/lib/firebase";
import { ref, onValue, update, serverTimestamp, query, orderByChild, equalTo } from "firebase/database";

export interface LedgerEntry {
  id: string; // driverId_restaurantId
  driverId: string;
  restaurantId: string;
  driverName?: string;
  restaurantName?: string;
  totalOwed: number;
  lastOrderId: string;
  orderIds?: string[];
  updatedAt: any;
  lastSettlementAt?: any;
  settledAmount?: number;
}

export interface Settlement {
  id: string;
  ledgerId: string;
  driverId: string;
  restaurantId: string;
  amount: number;
  settledAt: any;
  confirmedBy: string; // restaurant user ID
  notes?: string;
}

/**
 * Subscribe to ledger entries for a specific restaurant
 */
export function subscribeToRestaurantLedgers(
  restaurantId: string,
  callback: (ledgers: LedgerEntry[]) => void
): () => void {
  const ledgersRef = ref(database, 'ledgers');
  const restaurantLedgersQuery = query(
    ledgersRef,
    orderByChild('restaurantId'),
    equalTo(restaurantId)
  );

  const unsubscribe = onValue(restaurantLedgersQuery, (snapshot) => {
    const ledgers: LedgerEntry[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const ledger = childSnapshot.val();
        ledgers.push({
          id: childSnapshot.key!,
          ...ledger,
        });
      });
    }
    
    callback(ledgers);
  });

  return unsubscribe;
}

/**
 * Subscribe to ledger entries for a specific driver
 */
export function subscribeToDriverLedgers(
  driverId: string,
  callback: (ledgers: LedgerEntry[]) => void
): () => void {
  const ledgersRef = ref(database, 'ledgers');
  const driverLedgersQuery = query(
    ledgersRef,
    orderByChild('driverId'),
    equalTo(driverId)
  );

  const unsubscribe = onValue(driverLedgersQuery, (snapshot) => {
    const ledgers: LedgerEntry[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const ledger = childSnapshot.val();
        ledgers.push({
          id: childSnapshot.key!,
          ...ledger,
        });
      });
    }
    
    callback(ledgers);
  });

  return unsubscribe;
}

/**
 * Record a settlement payment from driver to restaurant
 */
export async function recordSettlement({
  ledgerId,
  driverId,
  restaurantId,
  amount,
  confirmedBy,
  notes,
}: {
  ledgerId: string;
  driverId: string;
  restaurantId: string;
  amount: number;
  confirmedBy: string;
  notes?: string;
}): Promise<void> {
  const settlementRef = ref(database, `settlements/${Date.now()}_${ledgerId}`);
  const ledgerRef = ref(database, `ledgers/${ledgerId}`);

  const updates: Record<string, any> = {};

  // Create settlement record
  updates[`settlements/${Date.now()}_${ledgerId}`] = {
    ledgerId,
    driverId,
    restaurantId,
    amount,
    settledAt: serverTimestamp(),
    confirmedBy,
    notes: notes || '',
  };

  // Update ledger with settlement info
  updates[`ledgers/${ledgerId}/totalOwed`] = { ".sv": { "increment": -amount } };
  updates[`ledgers/${ledgerId}/lastSettlementAt`] = serverTimestamp();
  updates[`ledgers/${ledgerId}/settledAmount`] = { ".sv": { "increment": amount } };

  await update(ref(database), updates);
}

/**
 * Subscribe to settlements for a restaurant
 */
export function subscribeToRestaurantSettlements(
  restaurantId: string,
  callback: (settlements: Settlement[]) => void
): () => void {
  const settlementsRef = ref(database, 'settlements');
  const restaurantSettlementsQuery = query(
    settlementsRef,
    orderByChild('restaurantId'),
    equalTo(restaurantId)
  );

  const unsubscribe = onValue(restaurantSettlementsQuery, (snapshot) => {
    const settlements: Settlement[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const settlement = childSnapshot.val();
        settlements.push({
          id: childSnapshot.key!,
          ...settlement,
        });
      });
    }
    
    // Sort by settlement date (most recent first)
    settlements.sort((a, b) => (b.settledAt || 0) - (a.settledAt || 0));
    callback(settlements);
  });

  return unsubscribe;
}

/**
 * Subscribe to settlements for a driver
 */
export function subscribeToDriverSettlements(
  driverId: string,
  callback: (settlements: Settlement[]) => void
): () => void {
  const settlementsRef = ref(database, 'settlements');
  const driverSettlementsQuery = query(
    settlementsRef,
    orderByChild('driverId'),
    equalTo(driverId)
  );

  const unsubscribe = onValue(driverSettlementsQuery, (snapshot) => {
    const settlements: Settlement[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const settlement = childSnapshot.val();
        settlements.push({
          id: childSnapshot.key!,
          ...settlement,
        });
      });
    }
    
    // Sort by settlement date (most recent first)
    settlements.sort((a, b) => (b.settledAt || 0) - (a.settledAt || 0));
    callback(settlements);
  });

  return unsubscribe;
}