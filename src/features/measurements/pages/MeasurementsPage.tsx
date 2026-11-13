import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { db } from '@/offline/database/dexie-db';
import { customerService } from '@/features/customers/services/customerService';
import type { MeasurementSet, Customer, MeasurementUnit } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Ruler,
  Plus,
  History,
  Sparkles,
  ChevronRight,
  Layers,
  ArrowRight,
  User,
} from 'lucide-react';

export const MeasurementsPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const navigate = useNavigate();

  const [measurementSets, setMeasurementSets] = useState<(MeasurementSet & { customerName?: string })[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [unit, setUnit] = useState<MeasurementUnit>(
    currentBusiness?.default_measurement_unit || 'cm'
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;
    setIsLoading(true);

    Promise.all([
      db.measurementSets.where('business_id').equals(currentBusiness.id).reverse().sortBy('created_at'),
      customerService.getCustomers(currentBusiness.id),
    ]).then(([sets, custList]) => {
      const custMap = new Map<string, string>();
      custList.forEach((c) => custMap.set(c.id, c.full_name));

      const hydrated = sets.map((s) => ({
        ...s,
        customerName: custMap.get(s.customer_id) || 'Client',
      }));

      setMeasurementSets(hydrated);
      setCustomers(custList);
      setIsLoading(false);
    });
  }, [currentBusiness]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">
              Measurement Sessions & Ruler
            </h1>
            <Badge variant="outline" className="text-[10px]">
              Signature Engine
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Capture anatomical body profiles with touch dragging and 0.1 fine precision stepping.
          </p>
        </div>

        <Link to="/app/measurements/new">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Measurement Session
          </Button>
        </Link>
      </div>

      {/* Signature Ruler Callout Card */}
      <div className="bg-black text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-300">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Interactive Tailoring Ruler</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Precision body dimension recording without spreadsheets
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Drag the ruler or use fine 0.1 step controls. Autosaves drafts locally in IndexedDB so you never lose a client fitting session.
          </p>
        </div>

        <Link to="/app/measurements/new">
          <Button
            size="lg"
            className="bg-white text-black hover:bg-neutral-100 shrink-0"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Interactive Ruler
          </Button>
        </Link>
      </div>

      {/* Historical Sessions Log */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-500" />
            <span>Completed Measurement Sessions ({measurementSets.length})</span>
          </h3>
        </div>

        {measurementSets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ruler className="w-8 h-8 mx-auto text-neutral-400" />
            <h4 className="text-sm font-bold text-black">No measurement sessions recorded yet</h4>
            <p className="text-xs text-[#777777] max-w-sm mx-auto">
              Select any client and record their measurements with our signature touch-enabled ruler.
            </p>
            <Link to="/app/measurements/new">
              <Button size="sm">Start First Measurement Session</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {measurementSets.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/app/customers/${s.customer_id}`)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                    <Ruler className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-black group-hover:underline flex items-center gap-2">
                      <span>{s.session_name}</span>
                      <Badge variant="outline" className="text-[9px]">
                        {s.garment_type}
                      </Badge>
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-black flex items-center gap-1">
                        <User className="w-3 h-3 text-neutral-400" />
                        {s.customerName}
                      </span>
                      &bull;
                      <span className="font-mono">{formatDate(s.created_at)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-black group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Open Set <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
