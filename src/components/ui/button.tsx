import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-md cursor-pointer whitespace-nowrap';

    const variants = {
      primary: 'bg-black text-white hover:bg-neutral-800 shadow-sm active:bg-neutral-900',
      secondary: 'bg-[#F5F5F5] text-[#111111] hover:bg-[#EBEBEB] active:bg-[#E0E0E0]',
      outline: 'border border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#FAFAFA] active:bg-[#F5F5F5]',
      ghost: 'bg-transparent text-[#111111] hover:bg-[#F5F5F5]',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5 min-w-[36px]',
      md: 'h-11 px-4 text-sm gap-2 min-h-[44px]',
      lg: 'h-13 px-6 text-base gap-2.5 min-h-[48px]',
      icon: 'h-11 w-11 p-0 min-h-[44px] min-w-[44px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

