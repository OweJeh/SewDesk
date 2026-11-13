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
          <div className="flex flex-col items-center justify-center -mt-6 sm:-mt-10 max-w-sm px-6">
            {/* SVG Symbol Animation Canvas (330 x 360 viewBox) */}
            <div className="relative w-56 h-64 sm:w-64 sm:h-72 flex items-center justify-center">
              {prefersReducedMotion ? (
                // Reduced Motion Alternative: Clean static fade-in
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <SewDeskSymbol
                    size={240}
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
                  {/* Scene 1: The Needle Appears (0.0s – 0.8s) */}
                  <NeedleAnimation
                    color={primaryColor}
                    delay={0.1}
                    duration={0.8}
                  />

                  {/* Scene 2 & 3: The Thread Enters, Threads Eye & Draws S-Stitch (0.8s – 3.7s) */}
                  <ThreadAnimation
                    color={primaryColor}
                    strokeWidth={3.6}
                    approachDelay={0.8}
                    approachDuration={0.85}
                    drawDelay={1.7}
                    drawDuration={2.0}
                  />
                </motion.svg>
              )}
            </div>

            {/* Scene 5: Typography Wordmark & Brand Line (Reveals at 4.2s) */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16 }
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
              className="text-center mt-3 sm:mt-5 flex flex-col items-center"
            >
              {/* Wordmark: SewDesk */}
              <h1
                style={{ color: primaryColor }}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans leading-none"
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
                className="text-[9px] sm:text-[10px] font-semibold tracking-[0.3em] uppercase mt-2.5 font-sans"
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

