import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeedleAnimation } from './NeedleAnimation';
import { ThreadAnimation } from './ThreadAnimation';
import { SewDeskSymbol } from './SewDeskSymbol';
import { Button } from '@/components/ui/button';
import { ChevronRight, RotateCcw } from 'lucide-react';

export interface SewDeskSplashScreenProps {
  onComplete?: () => void;
  autoDismiss?: boolean;
  theme?: 'light' | 'dark';
  enableSound?: boolean;
  className?: string;
  size?: 'compact' | 'medium' | 'large' | number;
}

const STORAGE_KEY = 'sewdesk_splash_shown';

/**
 * SewDeskSplashScreen — The Official Signature Logo Animation & Splash Screen.
 * Recreates the authentic tailor craft: a precision needle enters, threads itself through the eye,
 * draws the bespoke 'S' stitch monogram, settles into final equilibrium, and reveals the typography.
 *
 * Storyboard:
 * - Scene 1 (0.0s – 0.8s): The Needle Appears from lower-left.
 * - Scene 2 (0.8s – 1.7s): The Thread Enters & passes visibly through the needle eye.
 * - Scene 3 (1.7s – 3.8s): The Thread Draws the S-shaped stitch (Upper loop -> Waist -> Lower loop).
 * - Scene 4 (3.8s – 4.2s): The Completed Logo Settles with micro-tension tightening.
 * - Scene 5 (4.2s – 5.2s): The SewDesk Wordmark & MEASURE. MANAGE. CREATE. tagline appear.
 */
export const SewDeskSplashScreen: React.FC<SewDeskSplashScreenProps> = ({
  onComplete,
  autoDismiss = true,
  theme = 'light',
  className = '',
  size = 'compact',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Detect user's reduced-motion OS preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const primaryColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryColor = isDark ? '#888888' : '#777777';

  // Responsive size presets (default 'compact' is 4x smaller than original 256px)
  const sizeConfig =
    typeof size === 'number'
      ? {
          symbolClass: '',
          symbolStyle: { width: size, height: Math.round(size * (360 / 330)) },
          symbolPx: size,
          titleClass: 'text-xl sm:text-2xl font-bold tracking-tight',
          brandLineClass: 'text-[7.5px] sm:text-[8px] font-semibold tracking-[0.28em] mt-1.5',
          spacingClass: 'mt-2 sm:mt-2.5',
          containerClass: '-mt-4 sm:-mt-6 max-w-xs px-4',
        }
      : size === 'large'
      ? {
          symbolClass: 'w-56 h-64 sm:w-64 sm:h-72',
          symbolStyle: undefined,
          symbolPx: 240,
          titleClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
          brandLineClass: 'text-[9.5px] sm:text-[10px] font-semibold tracking-[0.3em] mt-2.5',
          spacingClass: 'mt-3 sm:mt-5',
          containerClass: '-mt-6 sm:-mt-10 max-w-sm px-6',
        }
      : size === 'medium'
      ? {
          symbolClass: 'w-28 h-32 sm:w-32 sm:h-36',
          symbolStyle: undefined,
          symbolPx: 128,
          titleClass: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
          brandLineClass: 'text-[8.5px] sm:text-[9.5px] font-semibold tracking-[0.3em] mt-2',
          spacingClass: 'mt-2.5 sm:mt-3.5',
          containerClass: '-mt-5 sm:-mt-8 max-w-xs px-5',
        }
      : {
          // 'compact' (Default) — 4 times smaller in dimension (~64px x 72px)
          symbolClass: 'w-16 h-18 sm:w-18 sm:h-20',
          symbolStyle: undefined,
          symbolPx: 64,
          titleClass: 'text-xl sm:text-2xl font-bold tracking-tight',
          brandLineClass: 'text-[7.5px] sm:text-[8px] font-semibold tracking-[0.28em] mt-1.5',
          spacingClass: 'mt-2 sm:mt-2.5',
          containerClass: '-mt-4 sm:-mt-6 max-w-xs px-4',
        };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
    if (onComplete) {
      setTimeout(onComplete, 400);
    }
  };

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!autoDismiss) return;

    // Total duration: 5.4 seconds before initiating smooth exit transition
    const totalTime = prefersReducedMotion ? 1800 : 5400;
    const timer = setTimeout(() => {
      handleDismiss();
    }, totalTime);

    return () => clearTimeout(timer);
  }, [autoDismiss, prefersReducedMotion, animationKey]);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          key={`splash-${animationKey}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
          style={{ backgroundColor: bgColor }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden ${className}`}
          role="dialog"
          aria-label="SewDesk Application Splash Screen"
        >
          {/* Top Control Bar (Skip / Replay controls) */}
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            <button
              onClick={handleReplay}
              title="Replay Animation"
              className={`p-2 rounded-full transition-colors text-xs flex items-center gap-1 ${
                isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
              }`}
              aria-label="Replay animation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDismiss}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1 ${
                isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
              }`}
              aria-label="Skip splash screen"
            >
              <span>Skip</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Central Logo & Animation Canvas */}
          <div className={`flex flex-col items-center justify-center ${sizeConfig.containerClass}`}>
            {/* SVG Symbol Animation Canvas (330 x 360 viewBox) */}
            <div
              className={`relative ${sizeConfig.symbolClass} flex items-center justify-center`}
              style={sizeConfig.symbolStyle}
            >
              {prefersReducedMotion ? (
                // Reduced Motion Alternative: Clean static fade-in
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <SewDeskSymbol
                    size={sizeConfig.symbolPx}
                    color={primaryColor}
                    variant={isDark ? 'white' : 'black'}
                  />
                </motion.div>
              ) : (
                // Full Signature Motion Choreography
                <motion.svg
                  viewBox="0 0 330 360"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full overflow-visible"
                  // Scene 4: Settle & tightening micro-scale tension
                  animate={{
                    scale: [1, 1, 1.02, 1],
                  }}
                  transition={{
                    times: [0, 0.75, 0.85, 1],
                    duration: 5.0,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Scene 2 & 3: The Thread Traces the S-Stitch (0.85s – 3.4s) */}
                  <ThreadAnimation
                    color={primaryColor}
                    strokeWidth={2.4}
                    drawDelay={0.85}
                    drawDuration={2.4}
                    isDark={isDark}
                  />

                  {/* Scene 1: The Needle Appears (0.0s – 0.8s, on top so eye opening frames thread) */}
                  <NeedleAnimation
                    color={primaryColor}
                    delay={0.1}
                    duration={0.8}
                  />
                </motion.svg>
              )}
            </div>

            {/* Scene 5: Typography Wordmark & Brand Line (Reveals at 4.2s) */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 12 }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: prefersReducedMotion ? 0.3 : 4.15,
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1], // Smooth deceleration curve
              }}
              className={`text-center ${sizeConfig.spacingClass} flex flex-col items-center`}
            >
              {/* Wordmark: SewDesk */}
              <h1
                style={{ color: primaryColor }}
                className={`${sizeConfig.titleClass} font-sans leading-none`}
              >
                SewDesk
              </h1>

              {/* Brand line: MEASURE. MANAGE. CREATE. */}
              <motion.p
                style={{ color: secondaryColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: prefersReducedMotion ? 0.5 : 4.45,
                  duration: 0.6,
                }}
                className={`${sizeConfig.brandLineClass} font-sans uppercase`}
              >
                MEASURE. MANAGE. CREATE.
              </motion.p>
            </motion.div>
          </div>

          {/* Footer Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: prefersReducedMotion ? 0.6 : 4.6, duration: 0.6 }}
            style={{ color: secondaryColor }}
            className="absolute bottom-6 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-center"
          >
            Digital Tailoring Workspace
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

