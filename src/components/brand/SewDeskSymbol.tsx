import React from 'react';
import { cn } from '@/lib/utils';
import {
  USER_NEEDLE_MAIN,
  USER_NEEDLE_TIP,
  USER_THREAD_MAIN,
  USER_THREAD_ACCENTS,
  SEWDESK_VIEWBOX,
} from './paths';

export interface SewDeskSymbolProps {
  className?: string;
  size?: number | string;
  color?: string;
  needleColor?: string;
  threadColor?: string;
  variant?: 'black' | 'white' | 'currentColor';
}

/**
 * SewDeskSymbol — The official signature brand mark of SewDesk.
 * Features the bespoke diagonal tailoring needle crossing through
 * a continuous stitched S-shaped thread monogram.
 *
 * Rendered using the user-provided vector assets in exact 330 x 360 geometry.
 */
export const SewDeskSymbol: React.FC<SewDeskSymbolProps> = ({
  className,
  size = 48,
  color,
  needleColor,
  threadColor,
  variant = 'currentColor',
}) => {
  const defaultFill =
    color ||
    (variant === 'white'
      ? '#FFFFFF'
      : variant === 'black'
      ? '#000000'
      : 'currentColor');

  const needleFill = needleColor || defaultFill;
  const threadFill = threadColor || defaultFill;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={SEWDESK_VIEWBOX}
      fill="none"
      width={size}
      height={size}
      className={cn('inline-block select-none overflow-visible', className)}
      aria-label="SewDesk signature needle and thread logo"
    >
      {/* Thread Layer */}
      <g id="thread-group">
        <path
          d={USER_THREAD_MAIN.d}
          transform={USER_THREAD_MAIN.transform}
          fill={threadFill}
        />
        {USER_THREAD_ACCENTS.map((accent, idx) => (
          <path
            key={idx}
            d={accent.d}
            transform={accent.transform}
            fill={threadFill}
            opacity={0.65}
          />
        ))}
      </g>

      {/* Needle Layer (On top, framing thread through hollow eye) */}
      <g id="needle-group">
        <path
          d={USER_NEEDLE_MAIN.d}
          transform={USER_NEEDLE_MAIN.transform}
          fill={needleFill}
        />
        <path
          d={USER_NEEDLE_TIP.d}
          transform={USER_NEEDLE_TIP.transform}
          fill={variant === 'white' ? '#FFFFFF' : needleFill}
          opacity={variant === 'white' ? 0.7 : 0.85}
        />
      </g>
    </svg>
  );
};
