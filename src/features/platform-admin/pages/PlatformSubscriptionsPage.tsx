import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sliders, Sparkles } from 'lucide-react';

export const PlatformSubscriptionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Platform Subscriptions</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Global view of studio subscriptions and customer threshold upgrades.
          </p>
        </div>
        <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-xs">
          GHS 150 / mo Standard
        </Badge>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-xs text-neutral-400">
        <Sliders className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
        No active paid subscriptions yet. Studios currently operate under the 100 free customer starter tier.
      </div>
    </div>
  );
};

