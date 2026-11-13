import React from 'react';
import { motion } from 'framer-motion';
import { SEWDESK_NEEDLE_PATH } from './paths';

export interface NeedleAnimationProps {
  color?: string;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * NeedleAnimation — Scene 1: The Needle Appears
 * Starts from lower-left with a delicate opacity fade and slight upward diagonal glide,
 * settling with precision into its final orientation with a clearly visible eye.
 */
export const NeedleAnimation: React.FC<NeedleAnimationProps> = ({
  color = '#000000',
  className,
  delay = 0,
  duration = 0.85,
}) => {
  return (
    <motion.path
      d={SEWDESK_NEEDLE_PATH}
      fill={color}
      fillRule="evenodd"
      className={className}
      initial={{
        opacity: 0,
        x: -55,
        y: 55,
        scale: 0.94,
        rotate: -4,
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
        ease: [0.16, 1, 0.3, 1], // Bespoke luxury spring/glide ease
      }}
    />
  );
};
