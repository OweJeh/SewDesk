import React from 'react';
import { motion } from 'framer-motion';
import { USER_THREAD_MAIN, USER_THREAD_ACCENTS } from './paths';

export interface ThreadAnimationProps {
  color?: string;
  className?: string;
  strokeWidth?: number;
  drawDelay?: number;
  drawDuration?: number;
  isDark?: boolean;
}

/**
 * ThreadAnimation — Scene 2 & 3: The Thread Traces the S-Shaped Monogram
 *
 * Traces the user's exact vector path directly out of the needle eye,
 * creating a crisp, sharp 60fps vector trace of the S-shape with zero blur
 * or mask artifacts. Right as the trace closes, the fill solidifies into
 * the exact filled SVG shape, with nothing more or less.
 */
export const ThreadAnimation: React.FC<ThreadAnimationProps> = ({
  color = '#000000',
  className,
  strokeWidth = 2.4,
  drawDelay = 0.85,
  drawDuration = 2.4,
  isDark = false,
}) => {
  const solidFill = isDark ? '#FFFFFF' : '#131313';

  return (
    <g className={className}>
      {/* Exact Vector Path Tracing with Settle Fill */}
      <motion.path
        d={USER_THREAD_MAIN.d}
        transform={USER_THREAD_MAIN.transform}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{
          pathLength: 0,
          fill: 'rgba(0, 0, 0, 0)',
        }}
        animate={{
          pathLength: 1,
          fill: [
            'rgba(0, 0, 0, 0)',
            'rgba(0, 0, 0, 0)',
            'rgba(0, 0, 0, 0)',
            solidFill,
          ],
        }}
        transition={{
          pathLength: {
            delay: drawDelay,
            duration: drawDuration,
            ease: [0.25, 0.1, 0.25, 1.0], // Elegant tailor pull curve
          },
          fill: {
            times: [0, 0.85, 0.95, 1.0],
            delay: drawDelay,
            duration: drawDuration + 0.35,
            ease: 'easeOut',
          },
        }}
      />

      {/* Subtle shading accents fade in on settle */}
      {USER_THREAD_ACCENTS.map((accent, idx) => (
        <motion.path
          key={idx}
          d={accent.d}
          transform={accent.transform}
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{
            delay: drawDelay + drawDuration * 0.9,
            duration: 0.4,
            ease: 'easeOut',
          }}
        />
      ))}
    </g>
  );
};
