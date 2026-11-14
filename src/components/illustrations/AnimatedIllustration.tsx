import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

/**
 * AnimatedIllustrationCard
 *
 * Wraps a child illustration (or any content) with:
 * - Dimmed opacity by default (0.35)
 * - Pops to full opacity + subtle scale on hover
 * - Smooth luxury easing
 * - Scroll-triggered entrance animation
 * - Respects prefers-reduced-motion
 */

interface AnimatedIllustrationCardProps {
  children: React.ReactNode;
  /** Delay for staggered entrance (seconds) */
  delay?: number;
  /** Custom class for the wrapper */
  className?: string;
  /** Whether the illustration should dim or stay visible */
  alwaysVisible?: boolean;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export const AnimatedIllustrationCard: React.FC<AnimatedIllustrationCardProps> = ({
  children,
  delay = 0,
  className = '',
  alwaysVisible = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={`group ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`group ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={delay}
    >
      {children}
    </motion.div>
  );
};

/**
 * IllustrationWrapper
 *
 * Wraps an SVG illustration specifically with the dim/pop behavior.
 * Dim by default, pops on hover with scale and opacity transitions.
 */
interface IllustrationWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const IllustrationWrapper: React.FC<IllustrationWrapperProps> = ({
  children,
  className = '',
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (prefersReducedMotion) {
    return (
      <div className={`opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.3, scale: 0.95 }}
      animate={{ opacity: 0.3, scale: 0.95 }}
      whileHover={{
        opacity: 1,
        scale: 1.08,
        transition: {
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedFeatureCard
 *
 * Full feature card with illustration, title, description.
 * Illustration dims by default, pops on card hover.
 * The whole card gets a subtle lift and border highlight.
 */
interface AnimatedFeatureCardProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

export const AnimatedFeatureCard: React.FC<AnimatedFeatureCardProps> = ({
  illustration,
  title,
  description,
  delay = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  return (
    <motion.div
      ref={ref}
      className={`group relative p-6 bg-white border border-[#E5E5E5] rounded-xl space-y-3 cursor-default
        transition-shadow duration-500 hover:shadow-lg hover:shadow-black/[0.04] hover:border-[#CCCCCC] ${className}`}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
      animate={
        prefersReducedMotion
          ? {}
          : isInView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 24 }
      }
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Illustration — dim by default, pop on card hover */}
      <motion.div
        className="w-full flex justify-center"
        initial={{ opacity: 0.25, scale: 0.92 }}
        animate={{ opacity: 0.25, scale: 0.92 }}
        whileHover={{
          opacity: 1,
          scale: 1.05,
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="w-28 h-28 md:w-32 md:h-32 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105">
          {illustration}
        </div>
      </motion.div>

      {/* Text */}
      <h3 className="text-sm font-bold text-black transition-colors duration-300">{title}</h3>
      <p className="text-xs text-[#777777] leading-relaxed">{description}</p>
    </motion.div>
  );
};

/**
 * AnimatedHeroDecoration
 *
 * A decorative element for the hero area — floating needle stitch
 * that subtly animates on scroll entry.
 */
interface AnimatedHeroDecorationProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedHeroDecoration: React.FC<AnimatedHeroDecorationProps> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, pathLength: 0 }}
      animate={
        isInView
          ? { opacity: 0.2 }
          : { opacity: 0 }
      }
      transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggeredSection
 *
 * Wraps a section with scroll-triggered staggered animation for its children.
 */
interface StaggeredSectionProps {
  children: React.ReactNode;
  className?: string;
}

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const sectionChildVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const StaggeredSection: React.FC<StaggeredSectionProps> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? (
          <motion.div variants={sectionChildVariants}>{child}</motion.div>
        ) : (
          child
        )
      )}
    </motion.div>
  );
};

