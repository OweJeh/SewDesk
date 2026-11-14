import React from 'react';

interface ThreadWordProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
  sizeMultiplier?: string;
}

/**
 * ThreadWord renders text in the delicate, thread-like cursive Sacramento font.
 * Tailored for starting words, flourishes, or signature bespoke accents.
 */
export const ThreadWord: React.FC<ThreadWordProps> = ({
  children,
  className = '',
  sizeMultiplier = 'text-[1.28em]',
  ...props
}) => {
  return (
    <span
      className={`font-thread font-normal normal-case tracking-normal inline-block align-baseline leading-none select-none ${sizeMultiplier} ${className}`}
      style={{ WebkitFontSmoothing: 'antialiased' }}
      {...props}
    >
      {children}
    </span>
  );
};

interface ThreadTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: string;
  words?: number;
  leadClassName?: string;
  restClassName?: string;
  className?: string;
  sizeMultiplier?: string;
}

/**
 * ThreadText styles the starting word(s) with the Sacramento thread-like cursive font.
 */
export const ThreadText: React.FC<ThreadTextProps> = ({
  children,
  words = 1,
  leadClassName = '',
  restClassName = '',
  className = '',
  sizeMultiplier = 'text-[1.28em]',
  ...props
}) => {
  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  const parts = children.trim().split(/\s+/);
  if (parts.length <= 1 && words >= 1) {
    return (
      <span className={className} {...props}>
        <ThreadWord className={leadClassName} sizeMultiplier={sizeMultiplier}>
          {children}
        </ThreadWord>
      </span>
    );
  }

  const leadWords = parts.slice(0, words).join(' ');
  const restWords = parts.slice(words).join(' ');

  return (
    <span className={`inline-block ${className}`} {...props}>
      <ThreadWord className={`mr-1.5 ${leadClassName}`} sizeMultiplier={sizeMultiplier}>
        {leadWords}
      </ThreadWord>
      {restWords && <span className={restClassName}>{restWords}</span>}
    </span>
  );
};

