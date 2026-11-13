import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SewDeskSymbol } from '@/components/brand/SewDeskSymbol';

export interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asLink?: boolean;
  to?: string;
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className,
  showTagline = false,
  size = 'md',
  asLink = true,
  to = '/',
  theme = 'light',
}) => {
  const iconPixelSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';
  const taglineColor = isDark ? 'text-neutral-400' : 'text-[#777777]';

  const content = (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {/* Official Signature Needle & Stitched 'S' Symbol */}
      <div className="shrink-0 flex items-center justify-center">
        <SewDeskSymbol
          size={iconPixelSizes[size]}
          variant={isDark ? 'white' : 'black'}
        />
      </div>

      <div className="flex flex-col justify-center">
        <span
          className={cn(
            'font-extrabold tracking-tight leading-none font-sans',
            textSizes[size],
            textColor
          )}
        >
          SewDesk
        </span>
        {showTagline && (
          <span
            className={cn(
              'text-[8.5px] font-semibold tracking-[0.25em] uppercase mt-1 font-sans',
              taglineColor
            )}
          >
            Measure. Manage. Create.
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to={to} className="inline-block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
