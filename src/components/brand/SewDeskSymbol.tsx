import React from 'react';
import { cn } from '@/lib/utils';
import { SEWDESK_NEEDLE_PATH, SEWDESK_THREAD_PATH } from './paths';

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
  const threadStroke = threadColor || defaultFill;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 300"
      fill="none"
      width={size}
      height={size}
      className={cn('inline-block select-none overflow-visible', className)}
      aria-label="SewDesk signature needle and thread logo"
    >
      {/* Sewing Needle: Tapered diagonal shaft with transparent eye opening */}
      <path
        d={SEWDESK_NEEDLE_PATH}
        fill={needleFill}
        fillRule="evenodd"
      />

      {/* Continuous Stitched Thread: Forming the flowing S-shape through the needle eye */}
      <path
        d={SEWDESK_THREAD_PATH}
        stroke={threadStroke}
        strokeWidth="4.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
