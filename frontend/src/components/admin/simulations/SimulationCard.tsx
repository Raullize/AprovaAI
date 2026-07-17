import { ChevronRight, GripVertical, Clock, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EntityCardActions } from '@/components/admin/shared/EntityCardActions';
import { type Simulation } from '@/services/simulations.service';
import { cn } from '@/lib/utils';
import { getIconOption } from '@/config/examThemes';

interface SimulationCardProps {
  simulation: Simulation;
  colorScheme?: string;
  iconKey?: string;
  onEdit: (id: string) => void;
  onDelete: (simulation: Simulation) => void;
  onToggleStatus: (simulation: Simulation) => void;
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

export function SimulationCard({
  simulation,
  colorScheme = 'indigo',
  iconKey = 'target',
  onEdit,
  onDelete,
  onToggleStatus,
  onNavigate,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
}: SimulationCardProps) {
  const theme = CARD_THEMES[colorScheme] || CARD_THEMES.indigo;
  const iconOpt = getIconOption(iconKey || 'target');
  const Icon = iconOpt.Icon;

  const showWarning = simulation.status === 'PUBLISHED' && (simulation.questionsCount ?? 0) === 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between group cursor-grab active:cursor-grabbing hover:shadow-lg',
        showWarning
          ? 'border-amber-300 hover:border-amber-400 hover:shadow-amber-500/10 bg-amber-50/5'
          : cn('border-slate-200 hover:border-indigo-300 hover:shadow-indigo-500/10', theme.hoverBorder, theme.hoverShadow),
        isDragging ? 'opacity-50 rotate-1 scale-105 shadow-2xl border-indigo-400' : '',
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
              <Icon className={cn('h-5 w-5', theme.iconText)} />
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={simulation.status} />
              {showWarning && (
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg uppercase tracking-wider animate-pulse">
                  <AlertTriangle className="h-3 w-3 text-amber-500 fill-current" />
                  Sem Questões
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <EntityCardActions
              status={simulation.status}
              onToggleStatus={() => onToggleStatus(simulation)}
              onEdit={() => onEdit(simulation.id)}
              onDelete={() => onDelete(simulation)}
            />
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1.5 leading-snug">
          {simulation.name}
        </h3>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Recompensa
            </span>
            <span className="text-sm font-semibold text-amber-600 truncate">
              {simulation.xpReward} XP
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Aprovação
            </span>
            <span className="text-sm font-semibold text-slate-700 truncate">
              {simulation.passingPercentage}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Tempo
            </span>
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1 truncate">
              {simulation.timeLimit ? (
                <>
                  <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                  {(() => {
                    const h = Math.floor(simulation.timeLimit / 3600);
                    const m = Math.floor((simulation.timeLimit % 3600) / 60);
                    const s = simulation.timeLimit % 60;
                    const parts = [];
                    if (h > 0) parts.push(`${h}h`);
                    if (m > 0) parts.push(`${m}m`);
                    if (s > 0) parts.push(`${s}s`);
                    return parts.join(' ');
                  })()}
                </>
              ) : (
                <span className="text-slate-400 italic text-xs">N/A</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <span className="font-semibold text-slate-600">
            {simulation.questionsCount ?? 0}
          </span>
          <span>questões</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(simulation.id)}
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
