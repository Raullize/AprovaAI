import { Target, ChevronRight, GripVertical } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EntityCardActions } from '@/components/admin/shared/EntityCardActions';
import { type Level } from '@/services/levels.service';
import { cn } from '@/lib/utils';

interface LevelCardProps {
  level: Level;
  colorScheme?: string;
  onEdit: (id: string) => void;
  onDelete: (level: Level) => void;
  onToggleStatus: (level: Level) => void;
  onNavigate: (id: string) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

const CARD_THEMES: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    hoverShadow: string;
    buttonText: string;
    buttonBorder: string;
    buttonHoverBg: string;
  }
> = {
  indigo: {
    iconBg: 'bg-indigo-50 group-hover:bg-indigo-100',
    iconText: 'text-indigo-600',
    hoverBorder: 'hover:border-indigo-300',
    hoverShadow: 'hover:shadow-indigo-500/10',
    buttonText: 'text-indigo-600',
    buttonBorder: 'border-indigo-200 hover:border-indigo-300',
    buttonHoverBg: 'hover:bg-indigo-50',
  },
  emerald: {
    iconBg: 'bg-emerald-50 group-hover:bg-emerald-100',
    iconText: 'text-emerald-600',
    hoverBorder: 'hover:border-emerald-300',
    hoverShadow: 'hover:shadow-emerald-500/10',
    buttonText: 'text-emerald-600',
    buttonBorder: 'border-emerald-200 hover:border-emerald-300',
    buttonHoverBg: 'hover:bg-emerald-50',
  },
  orange: {
    iconBg: 'bg-orange-50 group-hover:bg-orange-100',
    iconText: 'text-orange-600',
    hoverBorder: 'hover:border-orange-300',
    hoverShadow: 'hover:shadow-orange-500/10',
    buttonText: 'text-orange-600',
    buttonBorder: 'border-orange-200 hover:border-orange-300',
    buttonHoverBg: 'hover:bg-orange-50',
  },
  sky: {
    iconBg: 'bg-sky-50 group-hover:bg-sky-100',
    iconText: 'text-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverShadow: 'hover:shadow-sky-500/10',
    buttonText: 'text-sky-600',
    buttonBorder: 'border-sky-200 hover:border-sky-300',
    buttonHoverBg: 'hover:bg-sky-50',
  },
  violet: {
    iconBg: 'bg-violet-50 group-hover:bg-violet-100',
    iconText: 'text-violet-600',
    hoverBorder: 'hover:border-violet-300',
    hoverShadow: 'hover:shadow-violet-500/10',
    buttonText: 'text-violet-600',
    buttonBorder: 'border-violet-200 hover:border-violet-300',
    buttonHoverBg: 'hover:bg-violet-50',
  },
  rose: {
    iconBg: 'bg-rose-50 group-hover:bg-rose-100',
    iconText: 'text-rose-600',
    hoverBorder: 'hover:border-rose-300',
    hoverShadow: 'hover:shadow-rose-500/10',
    buttonText: 'text-rose-600',
    buttonBorder: 'border-rose-200 hover:border-rose-300',
    buttonHoverBg: 'hover:bg-rose-50',
  },
  amber: {
    iconBg: 'bg-amber-50 group-hover:bg-amber-100',
    iconText: 'text-amber-600',
    hoverBorder: 'hover:border-amber-300',
    hoverShadow: 'hover:shadow-amber-500/10',
    buttonText: 'text-amber-600',
    buttonBorder: 'border-amber-200 hover:border-amber-300',
    buttonHoverBg: 'hover:bg-amber-50',
  },
  slate: {
    iconBg: 'bg-slate-100 group-hover:bg-slate-200',
    iconText: 'text-slate-650',
    hoverBorder: 'hover:border-slate-400',
    hoverShadow: 'hover:shadow-slate-500/10',
    buttonText: 'text-slate-650',
    buttonBorder: 'border-slate-300 hover:border-slate-400',
    buttonHoverBg: 'hover:bg-slate-100',
  },
};

export function LevelCard({
  level,
  colorScheme = 'indigo',
  onEdit,
  onDelete,
  onToggleStatus,
  onNavigate,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
}: LevelCardProps) {
  const theme = CARD_THEMES[colorScheme] || CARD_THEMES.indigo;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'bg-white rounded-2xl border border-slate-200 transition-all duration-200 p-5 flex flex-col justify-between group cursor-grab active:cursor-grabbing hover:shadow-lg',
        theme.hoverBorder,
        theme.hoverShadow,
        isDragging
          ? 'opacity-50 rotate-1 scale-105 shadow-2xl border-indigo-400'
          : '',
      )}
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                theme.iconBg,
              )}
            >
              <Target className={cn('h-5 w-5', theme.iconText)} />
            </div>
            <StatusBadge status={level.status} />
          </div>
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <EntityCardActions
              status={level.status}
              onToggleStatus={() => onToggleStatus(level)}
              onEdit={() => onEdit(level.id)}
              onDelete={() => onDelete(level)}
            />
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1.5 leading-snug">
          {level.name}
        </h3>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Recompensa
            </span>
            <span className="text-sm font-semibold text-amber-600">
              {level.xpReward} XP
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Aprovação
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {level.passingPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <span className="font-semibold text-slate-600">
            {level.questionsCount ?? 0}
          </span>
          <span>questões</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(level.id)}
          className={cn(
            'text-xs transition-all',
            theme.buttonText,
            theme.buttonBorder,
            theme.buttonHoverBg,
          )}
        >
          Gerenciar Questões <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
