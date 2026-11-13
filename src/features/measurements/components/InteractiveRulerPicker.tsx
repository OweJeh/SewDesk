import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { MeasurementUnit } from '@/types';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SkipForward,
  Check,
  Sparkles,
} from 'lucide-react';

interface InteractiveRulerPickerProps {
  measurementName: string;
  description: string;
  category: string;
  value: number; // In current unit
  unit: MeasurementUnit;
  min: number;
  max: number;
  stepFine?: number; // 0.1
  stepCoarse?: number; // 0.5
  onValueChange: (newValue: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  onDone?: () => void;
  currentIndex: number;
  totalCount: number;
}

export const InteractiveRulerPicker: React.FC<InteractiveRulerPickerProps> = ({
  measurementName,
  description,
  category,
  value,
  unit,
  min,
  max,
  stepFine = 0.1,
  stepCoarse = 0.5,
  onValueChange,
  onNext,
  onPrev,
  onSkip,
  onDone,
  currentIndex,
  totalCount,
}) => {
  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startVal, setStartVal] = useState(0);

  // Clamp helper
  const clamp = useCallback(
    (val: number) => {
      const rounded = +val.toFixed(1);
      return Math.min(max, Math.max(min, rounded));
    },
    [min, max]
  );

  // Fine & Coarse Adjustments
  const handleAdjust = (delta: number) => {
    onValueChange(clamp(value + delta));
  };

  // Dragging logic (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartVal(value);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      setStartX(e.touches[0].clientX);
      setStartVal(value);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const diffX = e.clientX - startX;
      // 10 pixels drag = 0.1 units (sensitive & precise)
      const deltaVal = -(diffX / 12) * stepFine;
      onValueChange(clamp(startVal + deltaVal));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const diffX = e.touches[0].clientX - startX;
      const deltaVal = -(diffX / 12) * stepFine;
      onValueChange(clamp(startVal + deltaVal));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, startX, startVal, stepFine, clamp, onValueChange]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleAdjust(e.shiftKey ? stepCoarse : stepFine);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleAdjust(e.shiftKey ? -stepCoarse : -stepFine);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      handleAdjust(5.0);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      handleAdjust(-5.0);
    }
  };

  // Generate visual ruler tick marks around the current value
  // We show 9 prominent ticks centered around current value
  const offsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 outline-none focus:ring-1 focus:ring-black select-none"
    >
      {/* 1. Header with Step Progress */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">
            Measurement {currentIndex + 1} of {totalCount} &bull; {category}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mt-1">
            {measurementName}
          </h2>
          <p className="text-xs text-[#777777] mt-0.5 max-w-lg">{description}</p>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold text-neutral-400">
            {Math.round(((currentIndex + 1) / totalCount) * 100)}% Complete
          </div>
          <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Large Central Digital Measurement Readout */}
      <div className="text-center py-4 space-y-4">
        <div className="inline-flex items-baseline justify-center gap-3 px-8 py-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl shadow-inner min-w-[260px]">
          <span className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tight text-black">
            {value.toFixed(1)}
          </span>
          <span className="text-2xl font-bold uppercase text-neutral-400 font-mono">
            {unit}
          </span>
        </div>

        {/* Direct Numeric Input with Quick Reset */}
        <div className="flex items-center justify-center gap-2 max-w-[220px] mx-auto">
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onValueChange(clamp(val));
            }}
            className="w-full text-center text-sm font-mono font-bold py-1.5 border border-[#E5E5E5] rounded-md focus:border-black focus:outline-none"
            placeholder="Type value..."
          />
        </div>

        {/* 3. Coarse (0.5) and Fine (0.1) Stepping Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleAdjust(-5.0)}
            className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-md text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Subtract 5.0"
          >
            -5.0
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(-stepCoarse)}
            className="h-10 px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-md text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Coarse: -0.5"
          >
            -{stepCoarse}
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(-stepFine)}
            className="h-10 px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-md text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Fine: -0.1"
          >
            -{stepFine}
          </button>

          <div className="w-px h-6 bg-neutral-300 mx-1.5" />

          <button
            type="button"
            onClick={() => handleAdjust(stepFine)}
            className="h-10 px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-md text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Fine: +0.1"
          >
            +{stepFine}
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(stepCoarse)}
            className="h-10 px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-md text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Coarse: +0.5"
          >
            +{stepCoarse}
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(5.0)}
            className="h-10 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-md text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Add 5.0"
          >
            +5.0
          </button>
        </div>

        {/* 4. Touch & Mouse Draggable Ruler Canvas */}
        <div
          ref={rulerContainerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`relative w-full h-24 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl overflow-hidden flex items-center justify-center cursor-ew-resize shadow-inner select-none transition-colors ${
            isDragging ? 'bg-neutral-100 ring-2 ring-black' : 'hover:border-neutral-400'
          }`}
        >
          {/* Center Marker Line & Needle Hairline */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black z-30 -translate-x-1/2 flex flex-col items-center justify-between pointer-events-none">
            <div className="w-3 h-3 bg-black rotate-45 -translate-y-1.5 shadow-sm" />
            <div className="w-3 h-3 bg-black rotate-45 translate-y-1.5 shadow-sm" />
          </div>

          {/* Calibrated Tick Marks with Numbers */}
          <div className="flex items-end justify-center gap-3 text-[10px] font-mono text-neutral-400 w-full px-6 pointer-events-none">
            {offsets.map((offset) => {
              const tickVal = +(value + offset).toFixed(1);
              const isCenter = offset === 0;

              return (
                <div
                  key={offset}
                  className={`flex flex-col items-center transition-all ${
                    isCenter ? 'scale-115 font-bold text-black' : 'opacity-60'
                  }`}
                >
                  <div
                    className={`w-0.5 mb-1.5 transition-all ${
                      isCenter
                        ? 'h-10 bg-black'
                        : offset % 2 === 0
                        ? 'h-6 bg-neutral-400'
                        : 'h-3.5 bg-neutral-300'
                    }`}
                  />
                  <span>{tickVal}</span>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-1 right-2 text-[9px] text-neutral-400 pointer-events-none uppercase font-semibold">
            Drag to adjust &bull; Shift for coarse
          </div>
        </div>
      </div>

      {/* 5. Navigation & Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          onClick={onPrev}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        {onSkip && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSkip}
            leftIcon={<SkipForward className="w-4 h-4" />}
          >
            Skip Field
          </Button>
        )}

        {currentIndex === totalCount - 1 ? (
          <Button
            type="button"
            size="sm"
            onClick={onDone}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Done & Review Set
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={onNext}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next Measurement
          </Button>
        )}
      </div>
    </div>
  );
};

