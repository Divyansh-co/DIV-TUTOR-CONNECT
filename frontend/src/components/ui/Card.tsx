import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all dark:border-zinc-800/80 dark:bg-zinc-900/90 ${
        glass ? 'glass-panel' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
