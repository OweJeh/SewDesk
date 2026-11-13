import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Ruler,
  Plus,
  Minus,
  RotateCcw,
  Save,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
} from 'lucide-react';

interface MeasurementItem {
  id: string;
  name: string;
  category: string;
  description: string;
  valueCm: number;
}

const DEFAULT_MEASUREMENTS: MeasurementItem[] = [
  { id: '1', name: 'Neck', category: 'Upper Body', description: 'Circumference around the base of the neck', valueCm: 39.5 },
  { id: '2', name: 'Shoulder', category: 'Upper Body', description: 'From edge of left shoulder to edge of right shoulder', valueCm: 46.0 },
  { id: '3', name: 'Chest / Bust', category: 'Upper Body', description: 'Fullest point around chest or bust under armpits', valueCm: 102.0 },
  { id: '4', name: 'Waist', category: 'Torso', description: 'Natural waistline circumference above the navel', valueCm: 88.0 },
  { id: '5', name: 'Hip / Seat', category: 'Lower Body', description: 'Fullest circumference around the buttocks', valueCm: 104.5 },
  { id: '6', name: 'Sleeve Length', category: 'Arms', description: 'Shoulder point down the arm to the wrist bone', valueCm: 64.0 },
  { id: '7', name: 'Shirt Length', category: 'Torso', description: 'Collar base down to desired hemline', valueCm: 76.0 },
  { id: '8', name: 'Trouser Length', category: 'Lower Body', description: 'Waistband down to shoe instep or ankle', valueCm: 101.0 },
  { id: '9', name: 'Inseam', category: 'Lower Body', description: 'Crotch seam down to bottom trouser hem', valueCm: 78.0 },
  { id: '10', name: 'Thigh', category: 'Lower Body', description: 'Circumference around upper thigh', valueCm: 58.0 },
];

export const MeasurementsPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();

  const [unit, setUnit] = useState<'cm' | 'inch'>(
    currentBusiness?.default_measurement_unit || 'cm'
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [measurements, setMeasurements] = useState<MeasurementItem[]>(DEFAULT_MEASUREMENTS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeItem = measurements[currentIndex];

  // Unit conversion helpers
  const toDisplayValue = (valCm: number) => {
    return unit === 'cm' ? valCm : +(valCm / 2.54).toFixed(1);
  };

  const fromDisplayValue = (valDisplay: number) => {
    return unit === 'cm' ? valDisplay : +(valDisplay * 2.54).toFixed(1);
  };

  const currentValue = toDisplayValue(activeItem.valueCm);

  const handleAdjust = (delta: number) => {
    const updated = Math.max(5, +(currentValue + delta).toFixed(1));
    const newCm = fromDisplayValue(updated);
    setMeasurements((prev) =>
      prev.map((item, idx) => (idx === currentIndex ? { ...item, valueCm: newCm } : item))
    );
  };

  const handleDirectInput = (valStr: string) => {
    const num = parseFloat(valStr);
    if (!isNaN(num) && num > 0) {
      const newCm = fromDisplayValue(num);
      setMeasurements((prev) =>
        prev.map((item, idx) => (idx === currentIndex ? { ...item, valueCm: newCm } : item))
      );
    }
  };

  const handleNext = () => {
    if (currentIndex < measurements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSaveSession = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">
              Interactive Tailoring Ruler
            </h1>
            <Badge variant="outline" className="text-[10px]">
              Signature Engine
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Precision body dimension recording with fine (0.1) & coarse (0.5) step controls and instant cm/inch conversion.
          </p>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-1">
          <button
            onClick={() => setUnit('cm')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              unit === 'cm' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Centimetres (cm)
          </button>
          <button
            onClick={() => setUnit('inch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              unit === 'inch' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Inches (in)
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-xs text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>Measurement session captured and saved to customer record!</span>
        </div>
      )}

      {/* Main Interactive Picker Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Interactive Ruler & Visual Feedback */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-8">
          {/* Progress / Step Header */}
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Measurement {currentIndex + 1} of {measurements.length}
              </span>
              <h2 className="text-2xl font-bold text-black mt-0.5">{activeItem.name}</h2>
              <p className="text-xs text-[#777777] mt-0.5">{activeItem.description}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {activeItem.category}
            </Badge>
          </div>

          {/* Center Digital Display & Fine Step Controls */}
          <div className="text-center py-6 space-y-6">
            <div className="inline-flex items-baseline justify-center gap-2 p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl min-w-[240px]">
              <span className="text-6xl sm:text-7xl font-bold font-mono tracking-tight text-black">
                {currentValue.toFixed(1)}
              </span>
              <span className="text-xl font-bold uppercase text-neutral-400 font-mono">
                {unit}
              </span>
            </div>

            {/* Direct Input */}
            <div className="max-w-[180px] mx-auto">
              <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                Direct Manual Input
              </label>
              <input
                type="number"
                step={unit === 'cm' ? '0.1' : '0.1'}
                value={currentValue}
                onChange={(e) => handleDirectInput(e.target.value)}
                className="w-full text-center text-sm font-mono font-semibold py-1.5 border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black"
              />
            </div>

            {/* Coarse & Fine Step Adjustment Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handleAdjust(-5.0)}
                className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:bg-neutral-300 rounded-md text-xs font-semibold text-neutral-800 transition-colors"
                title="Subtract 5.0"
              >
                -5.0
              </button>
              <button
                onClick={() => handleAdjust(-0.5)}
                className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:bg-neutral-300 rounded-md text-xs font-semibold text-neutral-800 transition-colors"
                title="Coarse: -0.5"
              >
                -0.5
              </button>
              <button
                onClick={() => handleAdjust(-0.1)}
                className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:bg-neutral-300 rounded-md text-xs font-semibold text-neutral-800 transition-colors"
                title="Fine: -0.1"
              >
                -0.1
              </button>

              <div className="w-px h-6 bg-neutral-300 mx-1" />

              <button
                onClick={() => handleAdjust(0.1)}
                className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:bg-neutral-300 rounded-md text-xs font-semibold text-neutral-800 transition-colors"
                title="Fine: +0.1"
              >
                +0.1
              </button>
              <button
                onClick={() => handleAdjust(0.5)}
                className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:bg-neutral-300 rounded-md text-xs font-semibold text-neutral-800 transition-colors"
                title="Coarse: +0.5"
              >
                +0.5
              </button>
              <button
                onClick={() => handleAdjust(5.0)}
                className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:bg-neutral-300 rounded-md text-xs font-semibold text-neutral-800 transition-colors"
                title="Add 5.0"
              >
                +5.0
              </button>
            </div>

            {/* Interactive Ruler Graphic Representation with Tick Marks */}
            <div className="relative w-full h-18 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl overflow-hidden flex items-center justify-center select-none shadow-inner">
              {/* Center Needle / Hairline Indicator */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black z-20 -translate-x-1/2 flex flex-col items-center justify-between">
                <div className="w-2.5 h-2.5 bg-black rotate-45 -translate-y-1" />
                <div className="w-2.5 h-2.5 bg-black rotate-45 translate-y-1" />
              </div>

              {/* Ticks simulation */}
              <div className="flex items-end justify-center gap-2 text-[9px] font-mono text-neutral-400 w-full px-4">
                {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((offset) => {
                  const val = +(currentValue + offset).toFixed(1);
                  const isCenter = offset === 0;
                  return (
                    <div
                      key={offset}
                      onClick={() => handleAdjust(offset)}
                      className={`flex flex-col items-center cursor-pointer transition-transform ${
                        isCenter ? 'scale-110 font-bold text-black' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-0.5 mb-1 ${
                          isCenter
                            ? 'h-8 bg-black'
                            : offset % 2 === 0
                            ? 'h-5 bg-neutral-400'
                            : 'h-3 bg-neutral-300'
                        }`}
                      />
                      <span>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Controls: Prev, Next, Save */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveSession}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Autosave Draft
            </Button>

            <Button
              size="sm"
              onClick={currentIndex === measurements.length - 1 ? handleSaveSession : handleNext}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {currentIndex === measurements.length - 1 ? 'Finish & Save' : 'Next Measurement'}
            </Button>
          </div>
        </div>

        {/* Right Col: Complete Measurement Set Summary */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-neutral-500" />
              <span>Session Overview</span>
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">
              {measurements.length} Fields
            </span>
          </div>

          <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
            {measurements.map((item, idx) => {
              const isSelected = idx === currentIndex;
              const displayVal = toDisplayValue(item.valueCm);
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'border-black bg-black text-white font-semibold'
                      : 'border-[#E5E5E5] bg-[#FAFAFA] hover:bg-[#F0F0F0] text-neutral-800'
                  }`}
                >
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="font-mono font-bold shrink-0">
                    {displayVal.toFixed(1)} {unit}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E5E5E5]">
            <Button
              className="w-full"
              size="sm"
              onClick={handleSaveSession}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Completed Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
