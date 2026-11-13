import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  showTagline = false,
  size = 'md',
  asLink = true,
  to = '/',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const content = (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {/* Needle & Stitched Seam Icon */}
      <div className={cn('relative flex items-center justify-center bg-black rounded-lg p-1.5 shadow-sm', iconSizes[size])}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Needle Shaft */}
          <path d="M37 11L14 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Needle Point */}
          <path d="M14 34L10 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Needle Eye */}
          <ellipse
            cx="35.5"
            cy="12.5"
            rx="1.4"
            ry="2.8"
            transform="rotate(-45 35.5 12.5)"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="#000000"
          />
          {/* Precision Running Stitched Line */}
          <path
            d="M6 42C12 36 18 36 24 30C30 24 36 24 42 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="3.5 3.5"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={cn('font-bold tracking-tight text-black leading-none font-sans', textSizes[size])}>
          Sew<span className="font-light">Desk</span>
        </span>
        {showTagline && (
          <span className="text-[9px] font-semibold tracking-widest text-[#777777] uppercase mt-1">
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
