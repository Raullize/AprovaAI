import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StudyPanelProps {
  children: ReactNode;
  className?: string;
}

export function StudyPanel({ children, className }: StudyPanelProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl shadow-2xl shadow-slate-900/15 border border-slate-200',
        className,
      )}
    >
      {children}
    </div>
  );
}
