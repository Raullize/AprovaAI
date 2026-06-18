import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'normal' | 'large';
  hoverEffect?: boolean;
}

export function Card({
  children,
  className,
  padding = 'normal',
  hoverEffect = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl border border-slate-200 shadow-sm transition-all',
        {
          'p-0': padding === 'none',
          'p-4': padding === 'small',
          'p-5': padding === 'normal',
          'p-6': padding === 'large',
          'hover:shadow-md hover:border-indigo-300 hover:-translate-y-1':
            hoverEffect,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
