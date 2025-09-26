import { database } from "@/lib/firebase";
import { ref, push, set, update, serverTimestamp, runTransaction } from "firebase/database";

/**
 * Create a new order in Realtime Database using push().
 * Returns the new orderId.
 */
export async function createOrderRealtime({
  customerId,
  restaurantId,
  totalPrice,
}: {
  customerId: string;
  restaurantId: string;
  totalPrice: number;
}): Promise<string> {
  const ordersRef = ref(database, "orders");
  const newOrderRef = push(ordersRef);

  const orderData = {
    customerId,
    restaurantId,
    status: "pending",
    totalPrice,
    createdAt: serverTimestamp(),
  };

  await set(newOrderRef, orderData);

  return newOrderRef.key as string;
}

/**
 * When a driver accepts an order:
 * - Atomically updates /orders/{orderId} with driverId, status, acceptedAt
 * - Updates /ledgers/{driverId_restaurantId} with lastOrderId, totalOwed, updatedAt
 *   (If you need to store an array of orderIds, use a transaction for that node.)
 */
export async function driverAcceptOrderRealtime({
  orderId,
  driverId,
  driverName,
  restaurantId,
  orderAmount,
}: {
  orderId: string;
  driverId: string;
  driverName: string;
  restaurantId: string;
  orderAmount: number;
}) {
  const orderPath = `orders/${orderId}`;
  const ledgerKey = `${driverId}_${restaurantId}`;
  const ledgerPath = `ledgers/${ledgerKey}`;

  // Atomic multi-location update
  const updates: Record<string, any> = {};

  // Update order with driver info and status
  updates[`${orderPath}/driverId`] = driverId;
  updates[`${orderPath}/driverName`] = driverName;
  updates[`${orderPath}/status`] = "accepted";
  updates[`${orderPath}/acceptedAt`] = serverTimestamp();

  // Basic ledger update (if you want to store only the running total and last order)
  updates[`${ledgerPath}/driverId`] = driverId;
  updates[`${ledgerPath}/restaurantId`] = restaurantId;
  updates[`${ledgerPath}/lastOrderId`] = orderId;
  // Use Firebase's server-side increment for safety (requires database.rules.json support)
  updates[`${ledgerPath}/totalOwed`] = { ".sv": { "increment": orderAmount } };
  updates[`${ledgerPath}/updatedAt`] = serverTimestamp();

  await update(ref(database), updates);
}

/**
 * If you want to store a list of orderIds on the ledger, use this transaction helper (optional).
 */
export async function addOrderIdToLedgerList({
  driverId,
  restaurantId,
  orderId,
}: {
  driverId: string;
  restaurantId: string;
  orderId: string;
}) {
  const ledgerKey = `${driverId}_${restaurantId}`;
  const ledgerRef = ref(database, `ledgers/${ledgerKey}/orderIds`);

  await runTransaction(ledgerRef, (current: string[] | null) => {
    if (current === null) {
      return [orderId];
    }
    if (!current.includes(orderId)) {
      return [...current, orderId];
    }
    return current;
  });
}