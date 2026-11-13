import React, { useId } from 'react';
import { motion } from 'framer-motion';
import {
  USER_THREAD_MAIN,
  USER_THREAD_ACCENTS,
  THREAD_APPROACH_TRAJECTORY,
  THREAD_DRAW_MASK_PATH,
} from './paths';

export interface ThreadAnimationProps {
  color?: string;
  className?: string;
  strokeWidth?: number;
  approachDelay?: number;
  approachDuration?: number;
  drawDelay?: number;
  drawDuration?: number;
}

/**
 * ThreadAnimation — Orchestrates Scene 2 (Threading) & Scene 3 (S-Stitch Drawing)
 *
 * Scene 2 (0.8s – 1.6s):
 * A fine, flexible thread approaches from upper-right, arches naturally,
 * and passes visibly through the needle's eye opening at (255, 45).
 *
 * Scene 3 (1.6s – 3.6s):
 * From the eye, the thread is pulled continuously through the fabric,
 * drawing the upper rounded loop, crossing the waist, and looping into
 * the lower flourish. Uses an animated vector mask to reveal the user's
 * exact high-fidelity vector thread progressively with smooth linecaps.
 */
export const ThreadAnimation: React.FC<ThreadAnimationProps> = ({
  color = '#000000',
  className,
  strokeWidth = 3.6,
  approachDelay = 0.8,
  approachDuration = 0.85,
  drawDelay = 1.7,
  drawDuration = 2.0,
}) => {
  const maskId = useId();

  return (
    <g className={className}>
      <defs>
        {/* Progressive reveal mask following the exact thread centerline */}
        <mask id={maskId}>
          <motion.path
            d={THREAD_DRAW_MASK_PATH}
            fill="none"
            stroke="white"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: drawDelay,
              duration: drawDuration,
              ease: [0.35, 0.05, 0.15, 1.0], // Tailor pull easing
            }}
          />
        </mask>
      </defs>

      {/* Scene 2: Thread entering from upper-right & threading the needle eye */}
      <motion.path
        d={THREAD_APPROACH_TRAJECTORY}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 1, 0.4],
          opacity: [0, 1, 1, 0.7],
        }}
        transition={{
          times: [0, 0.7, 0.85, 1],
          delay: approachDelay,
          duration: approachDuration + 0.4,
          ease: 'easeInOut',
        }}
      />

      {/* Scene 3: Progressive reveal of the official user-provided thread vector */}
      <g mask={`url(#${maskId})`}>
        <path
          d={USER_THREAD_MAIN.d}
          transform={USER_THREAD_MAIN.transform}
          fill={color}
        />
        {USER_THREAD_ACCENTS.map((accent, idx) => (
          <path
            key={idx}
            d={accent.d}
            transform={accent.transform}
            fill={color}
            opacity={0.65}
          />
        ))}
      </g>
    </g>
  );
};
