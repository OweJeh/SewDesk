import React from 'react';
import { motion } from 'framer-motion';
import { USER_THREAD_MAIN, USER_THREAD_ACCENTS } from './paths';

export interface ThreadAnimationProps {
  color?: string;
  className?: string;
  strokeWidth?: number;
  entryDelay?: number;
  entryDuration?: number;
  drawDelay?: number;
  drawDuration?: number;
  isDark?: boolean;
}

/**
 * ThreadAnimation — Scene 2 & 3: Real Threading & S-Stitch Formation
 *
 * Storyboard:
 * 1. Scene 2 (0.8s – 1.6s): A fine thread enters from upper-right, arches naturally,
 *    and visibly threads right through the hollow needle eye opening at (255, 47).
 * 2. Scene 3 (1.6s – 3.7s): The thread is pulled through the needle eye:
 *    - The entry tail pulls through the hole and disappears cleanly into the stitch.
 *    - The emerging thread traces the exact S-shaped tailor monogram continuously.
 * 3. Scene 4 (3.7s – 4.1s): The completed thread closes its loop, solidifying into
 *    the exact solid filled shape of the official SewDesk logo, with zero stray lines.
 */
export const ThreadAnimation: React.FC<ThreadAnimationProps> = ({
  color = '#000000',
  className,
  strokeWidth = 7.2,
  entryDelay = 0.8,
  entryDuration = 1.8,
  drawDelay = 1.6,
  drawDuration = 2.1,
  isDark = false,
}) => {
  const solidFill = isDark ? '#FFFFFF' : '#131313';

  // Precision threading path: approaches from upper-right and pierces through the hollow eye
  const threadEntryPath = 'M 315 18 C 290 26, 272 38, 255 47 L 240 55';

  return (
    <g className={className}>
      {/* Scene 2: The Thread enters & threads visibly through the needle eye */}
      {/* As the stitch draws in Scene 3, this entry tail is pulled cleanly through the eye */}
      <motion.path
        d={threadEntryPath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{
          pathLength: 0,
          pathOffset: 0,
          opacity: 0,
        }}
        animate={{
          pathLength: [0, 1, 1, 1],
          pathOffset: [0, 0, 0.45, 1], // Pulled through the needle eye!
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          times: [0, 0.35, 0.7, 1],
          delay: entryDelay,
          duration: entryDuration,
          ease: 'easeInOut',
        }}
      />

      {/* Scene 3: The Thread emerging from the eye & tracing the exact S monogram */}
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
            ease: [0.25, 0.1, 0.25, 1.0], // Natural tailor drawing curve
          },
          fill: {
            times: [0, 0.88, 0.96, 1.0],
            delay: drawDelay,
            duration: drawDuration + 0.3,
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
            duration: 0.35,
            ease: 'easeOut',
          }}
        />
      ))}
    </g>
  );
};
