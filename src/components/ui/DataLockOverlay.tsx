import React from 'react';
import { Lock, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataLockOverlayProps {
  onUpgrade?: () => void;
  basePrice?: number;
}

/**
 * Full-page overlay shown when isDataLocked === true.
 * Renders on top of whichever data page it wraps.
 */
export const DataLockOverlay: React.FC<DataLockOverlayProps> = ({
  onUpgrade,
  basePrice = 50,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
      <div className="max-w-sm w-full mx-auto text-center space-y-4 p-6">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <Lock className="w-7 h-7 text-red-600" />
        </div>

        <div>
          <h3 className="text-base font-bold text-black">Data Access Locked</h3>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Your workspace subscription has expired. Your data is safe — subscribe to restore
            full access.
          </p>
        </div>

        {onUpgrade && (
          <Button
            onClick={onUpgrade}
            className="bg-black text-white hover:bg-neutral-800 text-xs gap-1.5 w-full"
          >
            <Zap className="w-3.5 h-3.5" />
            Renew Subscription — GH₵ {basePrice}/mo
          </Button>
        )}

        <p className="text-[10px] text-neutral-400">
          Contact support if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

