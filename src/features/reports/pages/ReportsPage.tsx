import React from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const currency = currentBusiness?.default_currency || 'GHS';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Studio Analytics & Reports</h1>
            <Badge variant="outline" className="text-[10px]">
              Export Ready
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Realtime metrics scoped exclusively to {currentBusiness?.business_name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-neutral-500" />
            <span>Orders by Production Stage</span>
          </h3>
          <div className="h-44 flex items-center justify-center border border-dashed border-[#E5E5E5] rounded-lg text-xs text-[#777777]">
            Workshop pipeline distribution will populate as orders are recorded.
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-500" />
            <span>Monthly Revenue Trajectory</span>
          </h3>
          <div className="h-44 flex items-center justify-center border border-dashed border-[#E5E5E5] rounded-lg text-xs text-[#777777]">
            Collected payments will appear here with monthly comparisons.
          </div>
        </div>
      </div>
    </div>
  );
};

