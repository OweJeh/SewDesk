import React, { useState } from 'react';
import type { MeasurementSet, MeasurementUnit } from '@/types';
import { measurementService } from '@/features/measurements/services/measurementService';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ArrowRight, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MeasurementComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  setA: MeasurementSet;
  setB: MeasurementSet;
  defaultUnit?: MeasurementUnit;
  onDuplicateSet?: (set: MeasurementSet) => void;
}

export const MeasurementComparisonModal: React.FC<MeasurementComparisonModalProps> = ({
  isOpen,
  onClose,
  setA,
  setB,
  defaultUnit = 'cm',
  onDuplicateSet,
}) => {
  const [unit, setUnit] = useState<MeasurementUnit>(defaultUnit);

  const deltas = measurementService.compareSets(setA, setB, unit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title="Measurement Comparison Analysis"
      description={`Side-by-side anatomical comparison between historical fitting sessions.`}
    >
      <div className="space-y-5">
        {/* Unit Selector */}
        <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#E5E5E5] p-2.5 rounded-lg">
          <div className="text-xs text-neutral-600 font-medium">
            Comparing: <strong>{setA.session_name}</strong> vs <strong>{setB.session_name}</strong>
          </div>
          <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] rounded p-0.5 text-xs">
            <button
              onClick={() => setUnit('cm')}
              className={`px-2 py-0.5 rounded font-semibold ${
                unit === 'cm' ? 'bg-black text-white' : 'text-neutral-600'
              }`}
            >
              cm
            </button>
            <button
              onClick={() => setUnit('inch')}
              className={`px-2 py-0.5 rounded font-semibold ${
                unit === 'inch' ? 'bg-black text-white' : 'text-neutral-600'
              }`}
            >
              in
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="border border-[#E5E5E5] rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-neutral-500 uppercase text-[10px] tracking-wider font-semibold sticky top-0">
              <tr>
                <th className="px-4 py-2.5">Body Dimension</th>
                <th className="px-4 py-2.5">{setA.session_name} ({formatDate(setA.created_at)})</th>
                <th className="px-4 py-2.5">{setB.session_name} ({formatDate(setB.created_at)})</th>
                <th className="px-4 py-2.5 text-right">Delta ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {deltas.map((d) => {
                const hasChanged = d.delta !== 0;
                const isIncrease = d.delta > 0;

                return (
                  <tr key={d.field_name} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-medium text-black">{d.field_name}</td>
                    <td className="px-4 py-2.5 font-mono text-neutral-600">
                      {d.valA > 0 ? `${d.valA.toFixed(1)} ${unit}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-black font-semibold">
                      {d.valB > 0 ? `${d.valB.toFixed(1)} ${unit}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold">
                      {!hasChanged ? (
                        <span className="text-neutral-400">0.0</span>
                      ) : isIncrease ? (
                        <span className="text-green-700 flex items-center justify-end gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{d.delta.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center justify-end gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          {d.delta.toFixed(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          {onDuplicateSet && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicateSet(setB)}
            >
              Duplicate {setB.session_name} as New Draft
            </Button>
          )}
          <Button size="sm" onClick={onClose} className="ml-auto">
            Close Analysis
          </Button>
        </div>
      </div>
    </Modal>
  );
};

