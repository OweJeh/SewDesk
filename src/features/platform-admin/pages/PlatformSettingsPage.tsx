import React from 'react';
import { Settings, ShieldCheck, Database, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const PlatformSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
        <h1 className="text-xl font-bold tracking-tight text-white">Platform System Configuration</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Server-side parameters, payment webhook URLs, and platform-wide subscription rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4 text-xs text-neutral-300">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Key className="w-4 h-4 text-neutral-400" />
            <span>Payment Provider Webhooks</span>
          </h3>
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Paystack Webhook Endpoint
            </label>
            <input
              type="text"
              readOnly
              value="https://api.sewdesk.com/functions/v1/paystack-webhook"
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-neutral-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Hubtel Webhook Endpoint
            </label>
            <input
              type="text"
              readOnly
              value="https://api.sewdesk.com/functions/v1/hubtel-webhook"
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-neutral-400"
            />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4 text-xs text-neutral-300">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Database className="w-4 h-4 text-neutral-400" />
            <span>Monetisation Constants</span>
          </h3>
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Free Customer Allowance Limit
            </label>
            <input
              type="text"
              readOnly
              value="100 Customers"
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-neutral-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Pro Monthly Subscription Price
            </label>
            <input
              type="text"
              readOnly
              value="GHS 150.00 / month"
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-neutral-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

