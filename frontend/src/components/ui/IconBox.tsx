import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface IconBoxProps {
  icon: ReactNode;
  colorScheme?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'square' | 'circle';
  className?: string;
  iconClassName?: string;
}

export function IconBox({
  icon,
  colorScheme = 'indigo',
  size = 'md',
  shape = 'square',
  className,
  iconClassName,
}: IconBoxProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16 lg:w-20 lg:h-20',
  };

  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  const shapeClasses = {
    square: 'rounded-xl',
    circle: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 shadow-sm',
        sizeClasses[size],
        colorClasses[colorScheme],
        shapeClasses[shape],
        className,
      )}
    >
      <div className={cn('flex items-center justify-center', iconClassName)}>
        {icon}
      </div>
    </div>
  );
}
