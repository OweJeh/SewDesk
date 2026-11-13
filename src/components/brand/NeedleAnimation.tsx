import React from 'react';
import { motion } from 'framer-motion';
import { USER_NEEDLE_MAIN, USER_NEEDLE_TIP } from './paths';

export interface NeedleAnimationProps {
  color?: string;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * NeedleAnimation — Scene 1: The Needle Appears (0.0s – 0.8s)
 * Starts from lower-left with a delicate opacity fade and slight upward diagonal glide,
 * settling with precision into its final diagonal orientation with a clearly visible eye.
 */
export const NeedleAnimation: React.FC<NeedleAnimationProps> = ({
  color = '#000000',
  className,
  delay = 0,
  duration = 0.8,
}) => {
  return (
    <motion.g
      className={className}
      initial={{
        opacity: 0,
        x: -55,
        y: 55,
        scale: 0.94,
        rotate: -3.5,
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
      }}
      transition={{
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1], // Smooth luxury glide
      }}
    >
      <path
        d={USER_NEEDLE_MAIN.d}
        transform={USER_NEEDLE_MAIN.transform}
        fill={color}
      />
      <path
        d={USER_NEEDLE_TIP.d}
        transform={USER_NEEDLE_TIP.transform}
        fill={color}
        opacity={0.8}
      />
    </motion.g>
  );
};
