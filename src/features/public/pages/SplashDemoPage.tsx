import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SewDeskSplashScreen } from '@/components/brand/SewDeskSplashScreen';
import { SewDeskSymbol } from '@/components/brand/SewDeskSymbol';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Sun,
  Moon,
  Download,
  ArrowRight,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const SplashDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [playCount, setPlayCount] = useState(1);
  const [showFullSplash, setShowFullSplash] = useState(true);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'}`}>
      {/* Full-Screen Splash Screen Overlay */}
      {showFullSplash && (
        <SewDeskSplashScreen
          key={`splash-${playCount}-${theme}`}
          theme={theme}
          autoDismiss={false} // Demo mode: lets user observe or manually dismiss
          onComplete={() => setShowFullSplash(false)}
        />
      )}

      {/* Brand Identity & Animation Review Studio */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                Brand Studio
              </Badge>
              <span className="text-xs text-neutral-400 font-mono">v1.0 Official Asset Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              SewDesk — Signature Logo & Splash Studio
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Precision bespoke needle & continuous stitched 'S' monogram identity system.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="gap-1.5"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowFullSplash(true);
                setPlayCount((p) => p + 1);
              }}
              className="gap-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Launch Splash Animation</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/dashboard')}
              className="gap-1.5"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Live Vector Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Mode Specimen */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
            <span className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Primary Lockup (Light Canvas #FFFFFF)
            </span>
            <div className="py-8">
              <SewDeskSymbol size={180} color="#000000" />
            </div>
            <div className="mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-black font-sans">
                SewDesk
              </h2>
              <p className="text-[9.5px] font-semibold tracking-[0.28em] text-neutral-500 uppercase mt-2">
                MEASURE. MANAGE. CREATE.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="/icons/sewdesk-logo.svg"
                download="sewdesk-logo-black.svg"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-black border border-neutral-200 hover:border-black rounded-lg px-3 py-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Vector SVG</span>
              </a>
            </div>
          </div>

          {/* Dark Mode Specimen */}
          <div className="bg-black border border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
            <span className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Inverted Lockup (Dark Canvas #000000)
            </span>
            <div className="py-8">
              <SewDeskSymbol size={180} color="#FFFFFF" variant="white" />
            </div>
            <div className="mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                SewDesk
              </h2>
              <p className="text-[9.5px] font-semibold tracking-[0.28em] text-neutral-400 uppercase mt-2">
                MEASURE. MANAGE. CREATE.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="/icons/sewdesk-logo-white.svg"
                download="sewdesk-logo-white.svg"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white border border-neutral-800 hover:border-white rounded-lg px-3 py-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download White SVG</span>
              </a>
            </div>
          </div>
        </div>

        {/* Storyboard Breakdown */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4 border-neutral-200 dark:border-neutral-800">
            <Sparkles className="w-4 h-4 text-black dark:text-white" />
            <h3 className="text-base font-bold text-black dark:text-white">
              Motion Choreography & Storyboard Execution (5.2s)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Scene 1 (0.0s – 0.8s)</span>
              <h4 className="text-xs font-bold text-black dark:text-white">The Needle Appears</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Slim tailoring needle glides delicately from lower-left, settling into diagonal orientation with transparent eye visible.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Scene 2 (0.8s – 1.7s)</span>
              <h4 className="text-xs font-bold text-black dark:text-white">The Thread Enters</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Silk thread glides from upper-right, aligns with the needle, and visibly travels through the needle eye opening.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Scene 3 (1.7s – 3.8s)</span>
              <h4 className="text-xs font-bold text-black dark:text-white">The 'S' Stitch Draws</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Thread draws the upper loop, crosses through the center waist, and sweeps around the lower loop in continuous motion.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Scene 4 (3.8s – 4.2s)</span>
              <h4 className="text-xs font-bold text-black dark:text-white">Completed Logo Settles</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Delicate micro-tension tightening settles the thread in equilibrium against the metallic needle shaft.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Scene 5 (4.2s – 5.2s)</span>
              <h4 className="text-xs font-bold text-black dark:text-white">Wordmark Reveal</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Bold SewDesk typography and MEASURE. MANAGE. CREATE. brand line fade and glide upward into vertical lockup.
              </p>
            </div>
          </div>
        </div>

        {/* Vector Asset Suite Downloads */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4 border-neutral-200 dark:border-neutral-800">
            <Layers className="w-4 h-4 text-black dark:text-white" />
            <h3 className="text-base font-bold text-black dark:text-white">
              Official Production SVG Asset Suite
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/icons/sewdesk-symbol.svg"
              download="sewdesk-symbol.svg"
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white">sewdesk-symbol.svg</h4>
                <p className="text-[11px] text-neutral-400">Standalone Needle & S Stitch Symbol (300x300)</p>
              </div>
              <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </a>

            <a
              href="/icons/sewdesk-wordmark.svg"
              download="sewdesk-wordmark.svg"
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white">sewdesk-wordmark.svg</h4>
                <p className="text-[11px] text-neutral-400">Typography Wordmark & Brand Line</p>
              </div>
              <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </a>

            <a
              href="/icons/sewdesk-logo.svg"
              download="sewdesk-logo.svg"
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white">sewdesk-logo.svg</h4>
                <p className="text-[11px] text-neutral-400">Complete Master Vertical Lockup</p>
              </div>
              <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </a>

            <a
              href="/icons/sewdesk-logo-white.svg"
              download="sewdesk-logo-white.svg"
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white">sewdesk-logo-white.svg</h4>
                <p className="text-[11px] text-neutral-400">Pure White for Dark & OLED Backgrounds</p>
              </div>
              <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </a>

            <a
              href="/icons/sewdesk-logo-black.svg"
              download="sewdesk-logo-black.svg"
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white">sewdesk-logo-black.svg</h4>
                <p className="text-[11px] text-neutral-400">Pure Black for High-Key Minimalist Prints</p>
              </div>
              <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </a>

            <a
              href="/sewdesk-sketch-ref.png"
              download="sewdesk-sketch-ref.png"
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white">sewdesk-sketch-ref.png</h4>
                <p className="text-[11px] text-neutral-400">Original Reference Brand Art</p>
              </div>
              <Download className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
