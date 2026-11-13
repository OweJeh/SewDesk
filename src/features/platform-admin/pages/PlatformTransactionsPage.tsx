import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';

export const PlatformTransactionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Payment Transactions</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Audit logs for Paystack, Hubtel, and MoMo webhook verifications.
          </p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-xs text-neutral-400">
        <CreditCard className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
        No platform subscription billing transactions recorded.
      </div>
    </div>
  );
};
