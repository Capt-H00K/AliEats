import React from 'react';
import { DollarSign, CreditCard } from 'lucide-react';

interface PaymentSelectorProps {
  paymentMethod: 'cash' | 'bank';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'cash' | 'bank'>>;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ paymentMethod, setPaymentMethod }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <button
        onClick={() => setPaymentMethod('cash')}
        className={`px-4 py-3 rounded-lg border-2 text-center transition-colors ${
          paymentMethod === 'cash'
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-transparent bg-muted text-muted-foreground hover:border-primary'
        }`}
      >
        <DollarSign className="mx-auto mb-2 h-5 w-5" />
        <span className="text-sm font-medium">Cash on Delivery</span>
      </button>
      <button
        onClick={() => setPaymentMethod('bank')}
        className={`px-4 py-3 rounded-lg border-2 text-center transition-colors ${
          paymentMethod === 'bank'
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-transparent bg-muted text-muted-foreground hover:border-primary'
        }`}
      >
        <CreditCard className="mx-auto mb-2 h-5 w-5" />
        <span className="text-sm font-medium">Bank Transfer</span>
      </button>
    </div>
  );
};
