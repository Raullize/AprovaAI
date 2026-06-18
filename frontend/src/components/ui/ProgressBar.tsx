import { cn } from '../../lib/utils';

interface ProgressBarProps {
  progress: number; // 0 to 100
  colorScheme?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  barClassName?: string;
}

export function ProgressBar({
  progress,
  colorScheme = 'indigo',
  size = 'md',
  className,
  barClassName,
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  const colorClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-500',
    gradient: 'bg-gradient-to-r from-indigo-500 to-violet-500',
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={cn(
        'w-full bg-slate-100 rounded-full overflow-hidden',
        sizeClasses[size],
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-1000 ease-out',
          colorClasses[colorScheme],
          barClassName,
        )}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
