import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { MeasurementUnit } from '@/types';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Check,
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

// ─────────────────────────────────────────────────────────────
// Synthesized Mechanical Tactile Audio & Haptic Vibration Engine
// ─────────────────────────────────────────────────────────────
let audioContextInstance: AudioContext | null = null;

const playHapticClickSound = (pitchMultiplier = 1) => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContextInstance) {
      audioContextInstance = new AudioContextClass();
    }
    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume();
    }

    const now = audioContextInstance.currentTime;
    const osc = audioContextInstance.createOscillator();
    const gain = audioContextInstance.createGain();

    // Tactile precision click sound (frequency sweep simulating mechanical dial detent)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(220 * pitchMultiplier, now + 0.009);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.009);

    osc.connect(gain);
    gain.connect(audioContextInstance.destination);

    osc.start(now);
    osc.stop(now + 0.01);

    // Haptic vibration feedback for mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(6);
    }
  } catch {
    // Autoplay restrictions or unsupported devices gracefully ignored
  }
};

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
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startVal, setStartVal] = useState(0);
  const lastTickValRef = useRef<number>(value);

  // In-place direct input editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editInputValue, setEditInputValue] = useState(value.toFixed(1));

  // Sync direct input value when value changes outside editing
  useEffect(() => {
    if (!isEditing) {
      setEditInputValue(value.toFixed(1));
    }
  }, [value, isEditing]);

  // Clamp helper
  const clamp = useCallback(
    (val: number) => {
      const rounded = +val.toFixed(1);
      return Math.min(max, Math.max(min, rounded));
    },
    [min, max]
  );

  // Adjust helper with haptics
  const handleAdjust = (delta: number) => {
    const newVal = clamp(value + delta);
    if (newVal !== value) {
      playHapticClickSound(Math.abs(delta) >= 1 ? 1.2 : 1.0);
      onValueChange(newVal);
    }
  };

  // Direct edit commit
  const handleCommitEdit = () => {
    setIsEditing(false);
    const parsed = parseFloat(editInputValue);
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed);
      onValueChange(clamped);
      setEditInputValue(clamped.toFixed(1));
      playHapticClickSound(1.1);
    } else {
      setEditInputValue(value.toFixed(1));
    }
  };

  // Swift Pointer Events (zero touch latency & pointer capture)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartVal(value);
    lastTickValRef.current = value;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const diffX = e.clientX - startX;
    // 12 pixels horizontal drag = 0.1 units (swift, high precision)
    const deltaVal = -(diffX / 12) * stepFine;
    const newVal = clamp(startVal + deltaVal);

    if (Math.abs(newVal - lastTickValRef.current) >= stepFine - 0.001) {
      playHapticClickSound(newVal % 1 === 0 ? 1.3 : 1.0);
      lastTickValRef.current = newVal;
    }
    onValueChange(newVal);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // release error ignore
    }
  };

  // Wheel / Trackpad scroll support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = (e.deltaY > 0 ? 1 : -1) * (e.shiftKey ? stepCoarse : stepFine);
    const newVal = clamp(value + delta);
    if (newVal !== value) {
      playHapticClickSound(newVal % 1 === 0 ? 1.25 : 1.0);
      onValueChange(newVal);
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) return;
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

  // Generate realistic physical measuring tape graduation marks
  // Render a continuous spread of ticks: $\pm 3.0$ units with fractional 0.1 steps
  const TICK_PX = 14; // pixels per 0.1 unit
  const visibleSteps = 24; // 24 steps each direction
  const ticks: { offsetVal: number; isWhole: boolean; isHalf: boolean }[] = [];

  for (let i = -visibleSteps; i <= visibleSteps; i++) {
    const tickVal = +(value + i * 0.1).toFixed(1);
    if (tickVal >= min && tickVal <= max) {
      const isWhole = Math.abs(tickVal - Math.round(tickVal)) < 0.01;
      const isHalf = Math.abs(tickVal - Math.floor(tickVal) - 0.5) < 0.01;
      ticks.push({ offsetVal: tickVal, isWhole, isHalf });
    }
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 outline-none focus:ring-1 focus:ring-black select-none"
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

      {/* 2. Direct Tap-To-Edit Large Central Measurement Display */}
      <div className="text-center py-2 space-y-3">
        <div
          onClick={() => {
            setIsEditing(true);
            setTimeout(() => inputRef.current?.select(), 25);
          }}
          title="Tap number to type directly"
          className="inline-flex items-baseline justify-center gap-3 px-8 py-4 bg-[#FAFAFA] border-2 border-[#E5E5E5] hover:border-black/50 focus-within:border-black focus-within:ring-4 focus-within:ring-black/5 rounded-2xl shadow-inner min-w-[280px] sm:min-w-[320px] cursor-text transition-all group"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={editInputValue}
              onChange={(e) => setEditInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommitEdit();
                } else if (e.key === 'Escape') {
                  setEditInputValue(value.toFixed(1));
                  setIsEditing(false);
                }
              }}
              onBlur={handleCommitEdit}
              className="w-40 sm:w-48 text-center text-6xl sm:text-7xl font-extrabold font-mono tracking-tight text-black bg-transparent outline-none border-b-2 border-black"
              autoFocus
            />
          ) : (
            <span className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tight text-black group-hover:scale-[1.02] transition-transform">
              {value.toFixed(1)}
            </span>
          )}
          <span className="text-2xl font-bold uppercase text-neutral-400 font-mono select-none">
            {unit}
          </span>
        </div>

        <p className="text-[10px] text-neutral-400 font-medium tracking-wide">
          Tap the big number to type directly &bull; Scroll or drag tape below
        </p>

        {/* 3. Coarse (0.5) and Fine (0.1) Stepping Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleAdjust(-5.0)}
            className="h-9 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Subtract 5.0"
          >
            -5.0
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(-stepCoarse)}
            className="h-9 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Coarse: -0.5"
          >
            -{stepCoarse}
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(-stepFine)}
            className="h-9 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Fine: -0.1"
          >
            -{stepFine}
          </button>

          <div className="w-px h-5 bg-neutral-300 mx-1" />

          <button
            type="button"
            onClick={() => handleAdjust(stepFine)}
            className="h-9 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Fine: +0.1"
          >
            +{stepFine}
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(stepCoarse)}
            className="h-9 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Coarse: +0.5"
          >
            +{stepCoarse}
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(5.0)}
            className="h-9 px-3 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            title="Add 5.0"
          >
            +5.0
          </button>
        </div>

        {/* 4. Realistic Physical Tailor's Measuring Tape Canvas */}
        <div
          ref={rulerContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          style={{ touchAction: 'none' }}
          className={`relative w-full h-28 rounded-2xl overflow-hidden flex items-center justify-center cursor-ew-resize select-none transition-all shadow-md ${
            isDragging
              ? 'ring-2 ring-black bg-[#FAF7F0]'
              : 'border-2 border-[#D8D2C4] bg-gradient-to-b from-[#FDFBF7] via-[#F7F3EB] to-[#ECE7DC] hover:border-neutral-500'
          }`}
        >
          {/* Subtle realistic tape top stitch hairline */}
          <div className="absolute top-1 inset-x-0 h-px border-b border-dashed border-[#D2CBBC] pointer-events-none opacity-60" />
          <div className="absolute bottom-1 inset-x-0 h-px border-t border-dashed border-[#D2CBBC] pointer-events-none opacity-60" />

          {/* Left & Right Depth Vignette Shading (Tape Roller Illusion) */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#ECE7DC] via-[#ECE7DC]/70 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#ECE7DC] via-[#ECE7DC]/70 to-transparent z-20 pointer-events-none" />

          {/* Center Precision Atelier Red Indicator Hairline with Triangles */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-600 z-30 -translate-x-1/2 flex flex-col items-center justify-between pointer-events-none shadow-sm">
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-red-600" />
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-red-600" />
          </div>

          {/* Calibrated Graduation Marks (Responsive Tick Tape) */}
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none overflow-hidden">
            {ticks.map((t) => {
              const diffFromCenter = t.offsetVal - value;
              const xPos = diffFromCenter * TICK_PX * 10; // 10 ticks per whole unit

              return (
                <div
                  key={t.offsetVal}
                  className="absolute flex flex-col items-center justify-start top-3 transition-opacity duration-75"
                  style={{
                    transform: `translateX(${xPos}px)`,
                    opacity: Math.abs(diffFromCenter) > 2.2 ? 0.2 : Math.abs(diffFromCenter) > 1.4 ? 0.5 : 1,
                  }}
                >
                  {/* Graduation Tick Mark */}
                  <div
                    className={`rounded-full transition-all ${
                      t.isWhole
                        ? 'h-11 w-[1.8px] bg-neutral-900'
                        : t.isHalf
                        ? 'h-7 w-[1.5px] bg-neutral-700'
                        : 'h-4 w-[1px] bg-neutral-400'
                    }`}
                  />

                  {/* Whole Number Labels */}
                  {t.isWhole && (
                    <span className="text-[11px] font-mono font-bold text-neutral-800 mt-1 select-none">
                      {Math.round(t.offsetVal)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tactile drag instruction footer */}
          <div className="absolute bottom-1 right-3 text-[9px] text-neutral-500 pointer-events-none uppercase font-semibold tracking-wider">
            Swift Touch Tape &bull; Wheel Scrollable
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
