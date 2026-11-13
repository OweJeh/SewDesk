import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  microLabel?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, microLabel, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {(label || microLabel) && (
          <div className="flex items-center justify-between">
            {label && (
              <label htmlFor={inputId} className="block text-xs font-medium text-neutral-800">
                {label}
              </label>
            )}
            {microLabel && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {microLabel}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3.5 py-2 text-sm text-[#111111] placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 transition-colors',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
