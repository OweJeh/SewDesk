import React from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Sparkles, UserPlus, Scissors } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();

  const sampleNotifications = [
    {
      id: '1',
      title: 'Free Customer Allowance Active',
      message: `Your business ${currentBusiness?.business_name || 'Studio'} has 100 free customer records available.`,
      time: 'Just now',
      type: 'system',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Notifications & Alerts</h1>
          <p className="text-xs text-[#777777] mt-1">
            Studio alerts, order updates, customer milestones, and staff activities.
          </p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />}>
          Mark All Read
        </Button>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm divide-y divide-[#E5E5E5]">
        {sampleNotifications.map((n) => (
          <div key={n.id} className="p-4 sm:p-5 flex items-start gap-3 hover:bg-neutral-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-black">{n.title}</h4>
                <span className="text-[10px] text-neutral-400 font-mono">{n.time}</span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

