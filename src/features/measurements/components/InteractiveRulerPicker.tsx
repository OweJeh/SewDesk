import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { MeasurementUnit } from '@/types';
import type { MeasurementFieldDef, MeasurementTemplateDef } from '@/features/measurements/data/templates';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Check,
  Maximize2,
  Minimize2,
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
  templates?: MeasurementTemplateDef[];
  selectedTemplateId?: string;
  onSelectTemplate?: (templateId: string) => void;
  fields?: MeasurementFieldDef[];
  fieldValues?: Record<string, number>;
  onSelectField?: (index: number) => void;
  onUnitChange?: (newUnit: MeasurementUnit) => void;
  isSaving?: boolean;
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

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(220 * pitchMultiplier, now + 0.009);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.009);

    osc.connect(gain);
    gain.connect(audioContextInstance.destination);

    osc.start(now);
    osc.stop(now + 0.01);

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
  templates,
  selectedTemplateId,
  onSelectTemplate,
  fields,
  fieldValues,
  onSelectField,
  onUnitChange,
  isSaving = false,
}) => {
  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeFieldChipRef = useRef<HTMLButtonElement>(null);
  const activeTemplateChipRef = useRef<HTMLButtonElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startVal, setStartVal] = useState(0);
  const lastTickValRef = useRef<number>(value);

  const [isEditing, setIsEditing] = useState(false);
  const [editInputValue, setEditInputValue] = useState(value.toFixed(1));
  const [isMaximized, setIsMaximized] = useState(false);

  // Lock body scroll when maximized
  useEffect(() => {
    if (isMaximized) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMaximized(false);
      };
      window.addEventListener('keydown', handleGlobalKeyDown);

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [isMaximized]);

  // Auto-scroll active field chip into view
  useEffect(() => {
    if (isMaximized && activeFieldChipRef.current) {
      activeFieldChipRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex, isMaximized, selectedTemplateId]);

  // Auto-scroll active template pill into view
  useEffect(() => {
    if (isMaximized && activeTemplateChipRef.current) {
      activeTemplateChipRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedTemplateId, isMaximized]);

  // Horizontal wheel scroll on strips
  const handleHorizontalWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    if (!isEditing) setEditInputValue(value.toFixed(1));
  }, [value, isEditing]);

  const clamp = useCallback(
    (val: number) => {
      const rounded = +val.toFixed(1);
      return Math.min(max, Math.max(min, rounded));
    },
    [min, max]
  );

  const handleAdjust = (delta: number) => {
    const newVal = clamp(value + delta);
    if (newVal !== value) {
      playHapticClickSound(Math.abs(delta) >= 1 ? 1.2 : 1.0);
      onValueChange(newVal);
    }
  };

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
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = (e.deltaY > 0 ? 1 : -1) * (e.shiftKey ? stepCoarse : stepFine);
    const newVal = clamp(value + delta);
    if (newVal !== value) {
      playHapticClickSound(newVal % 1 === 0 ? 1.25 : 1.0);
      onValueChange(newVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) return;
    if (e.key === 'Escape' && isMaximized) { e.preventDefault(); setIsMaximized(false); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); handleAdjust(e.shiftKey ? stepCoarse : stepFine); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); handleAdjust(e.shiftKey ? -stepCoarse : -stepFine); }
    else if (e.key === 'PageUp') { e.preventDefault(); handleAdjust(5.0); }
    else if (e.key === 'PageDown') { e.preventDefault(); handleAdjust(-5.0); }
  };

  const TICK_PX = 14;
  const visibleSteps = isMaximized ? 36 : 24;
  const ticks: { offsetVal: number; isWhole: boolean; isHalf: boolean }[] = [];
  for (let i = -visibleSteps; i <= visibleSteps; i++) {
    const tickVal = +(value + i * 0.1).toFixed(1);
    if (tickVal >= min && tickVal <= max) {
      const isWhole = Math.abs(tickVal - Math.round(tickVal)) < 0.01;
      const isHalf = Math.abs(tickVal - Math.floor(tickVal) - 0.5) < 0.01;
      ticks.push({ offsetVal: tickVal, isWhole, isHalf });
    }
  }

  const progressPct = Math.round(((currentIndex + 1) / totalCount) * 100);
  const isLast = currentIndex === totalCount - 1;

  // ─── Tape Rendering (shared between normal & maximized) ───
  const TapeCanvas = ({ className }: { className: string }) => (
    <div
      ref={rulerContainerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
      className={`relative w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-ew-resize select-none transition-all shadow-md ${
        isDragging
          ? 'ring-2 ring-black bg-[#FAF7F0]'
          : 'border-2 border-[#D8D2C4] bg-gradient-to-b from-[#FDFBF7] via-[#F7F3EB] to-[#ECE7DC] hover:border-neutral-500'
      } ${className}`}
    >
      {/* Tape stitching lines */}
      <div className="absolute top-1 inset-x-0 h-px border-b border-dashed border-[#D2CBBC] pointer-events-none opacity-60" />
      <div className="absolute bottom-1 inset-x-0 h-px border-t border-dashed border-[#D2CBBC] pointer-events-none opacity-60" />
      {/* Vignette edges */}
      <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[#ECE7DC] via-[#ECE7DC]/70 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[#ECE7DC] via-[#ECE7DC]/70 to-transparent z-20 pointer-events-none" />
      {/* Red center hairline */}
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-600 z-30 -translate-x-1/2 flex flex-col items-center justify-between pointer-events-none shadow-sm">
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-red-600" />
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-red-600" />
      </div>
      {/* Tick marks */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none overflow-hidden">
        {ticks.map((t) => {
          const diffFromCenter = t.offsetVal - value;
          const xPos = diffFromCenter * TICK_PX * 10;
          const fadeOuter = isMaximized ? 3.2 : 2.2;
          const fadeMid = isMaximized ? 2.2 : 1.4;
          return (
            <div
              key={t.offsetVal}
              className={`absolute flex flex-col items-center justify-start transition-opacity duration-75 ${isMaximized ? 'top-2' : 'top-3 sm:top-4'}`}
              style={{
                transform: `translateX(${xPos}px)`,
                opacity: Math.abs(diffFromCenter) > fadeOuter ? 0.2 : Math.abs(diffFromCenter) > fadeMid ? 0.5 : 1,
              }}
            >
              <div className={`rounded-full transition-all ${
                t.isWhole
                  ? isMaximized ? 'h-10 sm:h-14 w-[2px] bg-neutral-900' : 'h-11 w-[1.8px] bg-neutral-900'
                  : t.isHalf
                  ? isMaximized ? 'h-7 sm:h-9 w-[1.5px] bg-neutral-700' : 'h-7 w-[1.5px] bg-neutral-700'
                  : isMaximized ? 'h-4 sm:h-5 w-[1px] bg-neutral-400' : 'h-4 w-[1px] bg-neutral-400'
              }`} />
              {t.isWhole && (
                <span className={`${isMaximized ? 'text-[11px] sm:text-sm mt-1' : 'text-[11px] mt-1'} font-mono font-bold text-neutral-800 select-none`}>
                  {Math.round(t.offsetVal)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-1 right-3 text-[9px] text-neutral-500 pointer-events-none uppercase font-semibold tracking-wider">
        Swift Touch Tape · Wheel Scrollable
      </div>
    </div>
  );

  // ─── NORMAL (non-maximized) layout ───────────────────────────────────
  if (!isMaximized) {
    return (
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 outline-none focus:ring-1 focus:ring-black select-none transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-3 sm:pb-4 gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#777777] block truncate">
              Measurement {currentIndex + 1} of {totalCount} &bull; {category}
            </span>
            <h2 className="text-xl sm:text-3xl mt-1 font-extrabold tracking-tight text-black truncate">{measurementName}</h2>
            <p className="text-[#777777] mt-0.5 text-xs sm:text-sm line-clamp-2 sm:line-clamp-none max-w-xl">{description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-bold text-neutral-400">{progressPct}% Complete</div>
              <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-black transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMaximized(true)}
              aria-label="Maximize interactive ruler"
              title="Maximize to fit screen"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-black font-semibold text-[11px] sm:text-xs shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
              <span>Maximize</span>
            </button>
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="sm:hidden space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-400">
            <span>Progress</span>
            <span>{progressPct}% Complete</span>
          </div>
          <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Value display */}
        <div className="text-center py-1 sm:py-2 space-y-3 sm:space-y-4">
          <div
            onClick={() => { setIsEditing(true); setTimeout(() => inputRef.current?.select(), 25); }}
            title="Tap number to type directly"
            className="inline-flex items-baseline justify-center gap-2 sm:gap-3 bg-[#FAFAFA] border-2 border-[#E5E5E5] hover:border-black/50 focus-within:border-black focus-within:ring-4 focus-within:ring-black/5 rounded-2xl shadow-inner cursor-text transition-all group px-5 sm:px-8 py-3 sm:py-4 min-w-[220px] sm:min-w-[320px]"
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={editInputValue}
                onChange={(e) => setEditInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCommitEdit(); else if (e.key === 'Escape') { setEditInputValue(value.toFixed(1)); setIsEditing(false); } }}
                onBlur={handleCommitEdit}
                className="w-32 sm:w-48 text-center text-5xl sm:text-7xl font-extrabold font-mono tracking-tight text-black bg-transparent outline-none border-b-2 border-black"
                autoFocus
              />
            ) : (
              <span className="text-5xl sm:text-7xl font-extrabold font-mono tracking-tight text-black group-hover:scale-[1.02] transition-transform">
                {value.toFixed(1)}
              </span>
            )}
            <span className="text-xl sm:text-2xl font-bold uppercase text-neutral-400 font-mono select-none">{unit}</span>
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-400 font-medium tracking-wide">
            Tap the big number to type directly &bull; Scroll or drag tape below
          </p>

          {/* Step buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {[-5.0, -stepCoarse, -stepFine].map((d) => (
              <button key={d} type="button" onClick={() => handleAdjust(d)}
                className="h-8 sm:h-9 px-2.5 sm:px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-[11px] sm:text-xs font-semibold text-neutral-800 transition-all cursor-pointer">
                {d.toFixed(1)}
              </button>
            ))}
            <div className="w-px h-5 bg-neutral-300 mx-0.5 sm:mx-1" />
            {[stepFine, stepCoarse, 5.0].map((d) => (
              <button key={d} type="button" onClick={() => handleAdjust(d)}
                className="h-8 sm:h-9 px-2.5 sm:px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-[11px] sm:text-xs font-semibold text-neutral-800 transition-all cursor-pointer">
                +{d.toFixed(1)}
              </button>
            ))}
          </div>

          <TapeCanvas className="h-28" />
        </div>

        {/* Navigation */}
        <div className="pt-3 sm:pt-4 border-t border-[#E5E5E5]">
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" size="sm" disabled={currentIndex === 0} onClick={onPrev}
              leftIcon={<ChevronLeft className="w-4 h-4" />} className="text-xs px-2 sm:px-3">
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            {onSkip && (
              <Button type="button" variant="ghost" size="sm" onClick={onSkip}
                leftIcon={<SkipForward className="w-4 h-4" />} className="text-xs px-2 sm:px-3">
                <span className="hidden sm:inline">Skip Field</span>
                <span className="sm:hidden">Skip</span>
              </Button>
            )}
            {isLast ? (
              <Button type="button" size="sm" isLoading={isSaving} onClick={onDone}
                leftIcon={<Check className="w-4 h-4" />} className="text-xs px-3 sm:px-4">
                <span className="hidden sm:inline">Done & Review Set</span>
                <span className="sm:hidden">Done</span>
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={onNext}
                rightIcon={<ChevronRight className="w-4 h-4" />} className="text-xs px-3 sm:px-4">
                <span className="hidden sm:inline">Next Measurement</span>
                <span className="sm:hidden">Next</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── MAXIMIZED layout — fills 100dvh exactly, no dead space ──────────
  //
  // Layout (mobile portrait, ~375×667px):
  //   [A] Header bar              — shrink-0, ~56px
  //   [B] Progress strip          — shrink-0, ~20px
  //   [C] Value display           — shrink-0, ~80px
  //   [D] Step buttons            — shrink-0, ~44px (2 rows on xs, 1 row on sm+)
  //   [E] Ruler tape              — flex-1, min-h-[100px], fills leftover space
  //   [F] Nav bar (Prev/Skip/Next/Save) — shrink-0, ~48px
  //   [G] Template row            — shrink-0, ~36px (if templates present)
  //   [H] Field chips row         — shrink-0, ~56px (if fields present)
  //
  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[100] bg-white h-[100dvh] w-screen overflow-hidden overscroll-none select-none outline-none ruler-zoom-in"
    >
      {/* Inner wrapper: strict flex column filling full screen */}
      <div className="w-full h-full max-w-3xl mx-auto flex flex-col px-3 pt-2 pb-safe sm:px-5 sm:pt-3">

        {/* ── A. Header ──────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-b border-[#E5E5E5] pb-2">
          {/* Left: measurement info */}
          <div className="flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#999] block truncate">
              {currentIndex + 1}/{totalCount} &bull; {category}
            </span>
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-black truncate leading-tight mt-0.5">
              {measurementName}
            </h2>
            <p className="text-[10px] sm:text-xs text-neutral-500 truncate mt-0.5">{description}</p>
          </div>

          {/* Right: unit toggle + minimize */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onUnitChange && (
              <div className="flex items-center bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-0.5">
                <button type="button" onClick={() => onUnitChange('cm')}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition-colors cursor-pointer ${unit === 'cm' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'}`}>
                  cm
                </button>
                <button type="button" onClick={() => onUnitChange('inch')}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition-colors cursor-pointer ${unit === 'inch' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'}`}>
                  in
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsMaximized(false)}
              aria-pressed={true}
              aria-label="Minimize interactive ruler"
              title="Minimize (Esc)"
              className="px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-black font-semibold text-[10px] sm:text-xs shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5 text-black" />
              <span className="hidden xs:inline">Min</span>
            </button>
          </div>
        </div>

        {/* ── B. Progress bar ─────────────────────────────────────── */}
        <div className="shrink-0 pt-1.5 pb-1">
          <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* ── C–E. Central Measurement Area (centered cleanly between header and bottom dock) ── */}
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-2 sm:gap-3 py-1">
          {/* C. Value display */}
          <div className="flex items-center justify-center">
            <div
              onClick={() => { setIsEditing(true); setTimeout(() => inputRef.current?.select(), 25); }}
              title="Tap number to type directly"
              className="inline-flex items-baseline justify-center gap-2 bg-[#FAFAFA] border-2 border-[#E5E5E5] hover:border-black/40 focus-within:border-black focus-within:ring-4 focus-within:ring-black/5 rounded-2xl shadow-inner cursor-text transition-all group px-4 py-1.5 sm:px-6 sm:py-2"
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCommitEdit(); else if (e.key === 'Escape') { setEditInputValue(value.toFixed(1)); setIsEditing(false); } }}
                  onBlur={handleCommitEdit}
                  className="w-28 sm:w-40 text-center text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-black bg-transparent outline-none border-b-2 border-black"
                  autoFocus
                />
              ) : (
                <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-black group-hover:scale-[1.02] transition-transform">
                  {value.toFixed(1)}
                </span>
              )}
              <span className="text-lg sm:text-xl font-bold uppercase text-neutral-400 font-mono select-none">{unit}</span>
            </div>
          </div>

          {/* D. Step buttons */}
          {/* On xs (< 640px): 2 rows of 3; on sm+: single row */}
          <div>
            {/* Mobile: 2-row grid layout */}
            <div className="grid grid-cols-3 gap-1.5 sm:hidden">
              <button type="button" onClick={() => handleAdjust(-stepFine)}
                className="h-9 rounded-xl bg-[#F0F0F0] active:bg-[#E0E0E0] active:scale-95 text-sm font-bold text-neutral-900 transition-all cursor-pointer">
                -{stepFine.toFixed(1)}
              </button>
              <button type="button" onClick={() => handleAdjust(-stepCoarse)}
                className="h-9 rounded-xl bg-[#F0F0F0] active:bg-[#E0E0E0] active:scale-95 text-sm font-bold text-neutral-900 transition-all cursor-pointer">
                -{stepCoarse.toFixed(1)}
              </button>
              <button type="button" onClick={() => handleAdjust(-5.0)}
                className="h-9 rounded-xl bg-[#F0F0F0] active:bg-[#E0E0E0] active:scale-95 text-sm font-bold text-neutral-900 transition-all cursor-pointer">
                -5.0
              </button>
              <button type="button" onClick={() => handleAdjust(stepFine)}
                className="h-9 rounded-xl bg-[#F0F0F0] active:bg-[#E0E0E0] active:scale-95 text-sm font-bold text-neutral-900 transition-all cursor-pointer">
                +{stepFine.toFixed(1)}
              </button>
              <button type="button" onClick={() => handleAdjust(stepCoarse)}
                className="h-9 rounded-xl bg-[#F0F0F0] active:bg-[#E0E0E0] active:scale-95 text-sm font-bold text-neutral-900 transition-all cursor-pointer">
                +{stepCoarse.toFixed(1)}
              </button>
              <button type="button" onClick={() => handleAdjust(5.0)}
                className="h-9 rounded-xl bg-[#F0F0F0] active:bg-[#E0E0E0] active:scale-95 text-sm font-bold text-neutral-900 transition-all cursor-pointer">
                +5.0
              </button>
            </div>
            {/* sm+: single row */}
            <div className="hidden sm:flex items-center justify-center gap-2">
              {[-5.0, -stepCoarse, -stepFine].map((d) => (
                <button key={d} type="button" onClick={() => handleAdjust(d)}
                  className="h-9 px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-xs font-semibold text-neutral-800 transition-all cursor-pointer">
                  {d.toFixed(1)}
                </button>
              ))}
              <div className="w-px h-5 bg-neutral-300 mx-1" />
              {[stepFine, stepCoarse, 5.0].map((d) => (
                <button key={d} type="button" onClick={() => handleAdjust(d)}
                  className="h-9 px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 rounded-lg text-xs font-semibold text-neutral-800 transition-all cursor-pointer">
                  +{d.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {/* E. Ruler tape — bounded comfortable height */}
          <TapeCanvas className="h-32 sm:h-36 shrink-0" />
        </div>

        {/* ── F. Navigation bar ─────────────────────────────────────── */}
        <div className="shrink-0 border-t border-[#E5E5E5] pt-2 pb-1">
          <div className="flex items-center justify-between gap-1.5">
            <Button type="button" variant="outline" size="sm" disabled={currentIndex === 0} onClick={onPrev}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              className="text-xs px-2 sm:px-3 h-9 sm:h-10">
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            {onSkip && (
              <Button type="button" variant="ghost" size="sm" onClick={onSkip}
                leftIcon={<SkipForward className="w-4 h-4" />}
                className="text-xs px-2 sm:px-3 h-9 sm:h-10">
                Skip
              </Button>
            )}

            <div className="flex items-center gap-1.5">
              <Button type="button"
                variant={isLast ? 'outline' : 'primary'} size="sm"
                disabled={isLast} onClick={onNext}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="text-xs px-2.5 sm:px-4 h-9 sm:h-10">
                Next
              </Button>
              {onDone && (
                <Button type="button"
                  variant={isLast ? 'primary' : 'outline'} size="sm"
                  isLoading={isSaving}
                  onClick={() => { setIsMaximized(false); onDone(); }}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="text-xs px-2.5 sm:px-4 h-9 sm:h-10">
                  <span className="hidden sm:inline">Save Set</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── G. Template selector row (maximized only) ─────────────── */}
        {templates && templates.length > 0 && onSelectTemplate && (
          <div className="shrink-0 border-t border-neutral-100 pt-1.5 pb-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">Template</span>
              <div
                onWheel={handleHorizontalWheel}
                className="ruler-scroll-strip flex items-center gap-1.5 overflow-x-auto touch-pan-x flex-1"
              >
                {templates.map((t) => {
                  const isActive = t.id === selectedTemplateId;
                  return (
                    <button
                      key={t.id}
                      ref={isActive ? activeTemplateChipRef : undefined}
                      type="button"
                      onClick={() => onSelectTemplate(t.id)}
                      className={`shrink-0 px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-[#FAFAFA] text-neutral-700 border-[#E5E5E5] hover:border-neutral-400 hover:bg-neutral-100'
                      }`}
                    >
                      {t.name} ({t.fields.length})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── H. Field chips row (maximized only) ───────────────────── */}
        {fields && fields.length > 0 && onSelectField && (
          <div className="shrink-0 pb-2">
            <div
              onWheel={handleHorizontalWheel}
              className="ruler-scroll-strip flex items-center gap-1.5 overflow-x-auto touch-pan-x"
            >
              {fields.map((f, idx) => {
                const isActive = idx === currentIndex;
                const pointVal = fieldValues?.[f.name] ?? 0;
                return (
                  <button
                    key={f.id}
                    ref={isActive ? activeFieldChipRef : undefined}
                    type="button"
                    onClick={() => onSelectField(idx)}
                    className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col min-w-[86px] sm:min-w-[106px] ${
                      isActive
                        ? 'bg-black text-white border-black shadow-md ring-2 ring-black/15'
                        : 'bg-[#FAFAFA] text-neutral-800 border-[#E5E5E5] hover:border-neutral-400 hover:bg-neutral-100'
                    }`}
                  >
                    <span className={`text-[9px] sm:text-[10px] font-semibold truncate max-w-[120px] ${isActive ? 'text-white' : 'text-neutral-600'}`}>
                      {idx + 1}. {f.name}
                    </span>
                    <span className={`text-[11px] sm:text-xs font-mono font-bold mt-0.5 ${isActive ? 'text-neutral-200' : 'text-black'}`}>
                      {pointVal.toFixed(1)} {unit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
