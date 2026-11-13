import React from 'react';
import { motion } from 'framer-motion';
import { SEWDESK_THREAD_ANIM_PATH, SEWDESK_THREAD_APPROACH_PATH } from './paths';

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
 * ThreadAnimation — Scene 2 & Scene 3
 * Scene 2: Thread approaches from upper-right and threads through the needle eye opening.
 * Scene 3: Continuous path drawing forming the upper loop, waist, and lower loop of the S-stitch.
 */
export const ThreadAnimation: React.FC<ThreadAnimationProps> = ({
  color = '#000000',
  className,
  strokeWidth = 4.8,
  approachDelay = 0.85,
  approachDuration = 0.85,
  drawDelay = 1.75,
  drawDuration = 2.05,
}) => {
  return (
    <g className={className}>
      {/* Scene 2: Entry approach tail traveling through the needle eye */}
      <motion.path
        d={SEWDESK_THREAD_APPROACH_PATH}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: [0, 1, 1],
        }}
        transition={{
          delay: approachDelay,
          duration: approachDuration,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />

      {/* Scene 3: The S-Stitch drawing from the eye (Upper loop -> Center waist -> Lower loop) */}
      <motion.path
        d={SEWDESK_THREAD_ANIM_PATH}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: drawDelay,
          duration: drawDuration,
          ease: [0.35, 0.05, 0.15, 1.0], // Natural tailor thread pull easing
        }}
      />
    </g>
  );
};
