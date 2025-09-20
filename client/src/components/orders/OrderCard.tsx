import React from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, MapPin, Clock, Check, Truck } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  userRole: 'customer' | 'driver' | 'restaurant';
  onUpdateStatus?: (orderId: string, status: Order['status']) => void;
  onConfirmPayment?: (orderId: string) => void;
  onAcceptOrder?: () => void; // For driver to accept the order
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  userRole,
  onUpdateStatus,
  onConfirmPayment,
  onAcceptOrder,
}) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'preparing':
        return 'bg-secondary/10 text-secondary';
      case 'ready':
        return 'bg-primary/10 text-primary';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-accent/10 text-accent';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  // Defensive for possibly undefined id and createdAt
  const orderId = order.id ?? '';
  const orderIdShort = order.id ? order.id.slice(-8) : 'N/A';
  const createdAtString =
    order.createdAt instanceof Date
      ? order.createdAt.toLocaleString()
      : order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : 'Unknown';

  return (
    <div className="border border-border rounded-lg p-4" data-testid={`card-order-${orderId}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg" data-testid={`text-order-id-${orderId}`}>
            Order #{orderIdShort}
          </h4>
          {userRole !== 'customer' && (
            <p className="text-muted-foreground" data-testid={`text-customer-${orderId}`}>
              Customer: {order.customerName}
            </p>
          )}
          {order.customerAddress && (
            <p className="text-sm text-muted-foreground flex items-center" data-testid={`text-address-${orderId}`}>
              <MapPin size={12} className="mr-1" />
              {order.customerAddress}
            </p>
          )}
          <p className="text-sm text-muted-foreground flex items-center" data-testid={`text-time-${orderId}`}>
            <Clock size={12} className="mr-1" />
            {createdAtString}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
            data-testid={`status-${orderId}`}
          >
            {getStatusLabel(order.status)}
          </span>
          <p className="text-lg font-bold mt-1" data-testid={`text-total-${orderId}`}>
            ${order.totalPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium mb-1">Items:</p>
        <div className="text-sm text-muted-foreground" data-testid={`text-items-${orderId}`}>
          {order.items?.map((item, index) => (
            <span key={index}>
              {item.quantity}x {item.menuItem.name}
              {index < order.items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm">
          {order.paymentMethod === 'cash' ? (
            <DollarSign size={16} className="mr-2 text-muted-foreground" />
          ) : (
            <CreditCard size={16} className="mr-2 text-muted-foreground" />
          )}
          <span data-testid={`text-payment-method-${orderId}`}>
            {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Bank Transfer'}
          </span>
          <span
            className={`ml-2 px-2 py-1 rounded-full text-xs ${
              order.paymentConfirmed ? 'bg-accent/10 text-accent' : 'bg-yellow-100 text-yellow-800'
            }`}
            data-testid={`status-payment-${orderId}`}
          >
            {order.paymentConfirmed ? 'Paid' : 'Pending'}
          </span>
        </div>

        <div className="flex gap-2">
          {/* Driver Actions */}
          {userRole === 'driver' && (
            <>
              {/* Accept order if status is pending */}
              {order.status === 'pending' && !!onAcceptOrder && (
                <Button
                  onClick={onAcceptOrder}
                  className="bg-accent text-accent-foreground"
                  size="sm"
                  data-testid={`button-accept-order-${orderId}`}
                >
                  <Check size={16} className="mr-2" />
                  Accept Order
                </Button>
              )}
              {order.status === 'ready' && (
                <Button
                  onClick={() => onUpdateStatus?.(orderId, 'picked_up')}
                  variant="secondary"
                  size="sm"
                  data-testid={`button-pickup-${orderId}`}
                >
                  <Truck size={16} className="mr-2" />
                  Picked Up
                </Button>
              )}
              {order.status === 'picked_up' &&
                order.paymentMethod === 'cash' &&
                !order.paymentConfirmed && (
                  <Button
                    onClick={() => onConfirmPayment?.(orderId)}
                    className="bg-primary text-primary-foreground"
                    size="sm"
                    data-testid={`button-confirm-payment-${orderId}`}
                  >
                    <DollarSign size={16} className="mr-2" />
                    Confirm Payment
                  </Button>
                )}
              {order.status === 'picked_up' &&
                (order.paymentMethod === 'bank' || order.paymentConfirmed) && (
                  <Button
                    onClick={() => onUpdateStatus?.(orderId, 'delivered')}
                    className="bg-accent text-accent-foreground"
                    size="sm"
                    data-testid={`button-deliver-${orderId}`}
                  >
                    <Check size={16} className="mr-2" />
                    Delivered
                  </Button>
                )}
            </>
          )}

          {/* Restaurant Actions */}
          {userRole === 'restaurant' && (
            <>
              {order.status === 'pending' && (
                <>
                  <Button
                    onClick={() => onUpdateStatus?.(orderId, 'rejected')}
                    variant="destructive"
                    size="sm"
                    data-testid={`button-reject-${orderId}`}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => onUpdateStatus?.(orderId, 'accepted')}
                    className="bg-accent text-accent-foreground"
                    size="sm"
                    data-testid={`button-accept-${orderId}`}
                  >
                    <Check size={16} className="mr-2" />
                    Accept
                  </Button>
                </>
              )}
              {(order.status === 'accepted' || order.status === 'preparing') && (
                <Button
                  onClick={() => onUpdateStatus?.(orderId, 'ready')}
                  className="bg-accent text-accent-foreground"
                  size="sm"
                  data-testid={`button-mark-ready-${orderId}`}
                >
                  <Check size={16} className="mr-2" />
                  Mark as Ready
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};