import { Target, ChevronRight, GripVertical } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EntityCardActions } from '@/components/admin/shared/EntityCardActions';
import { type Level } from '@/services/levels.service';

interface LevelCardProps {
  level: Level;
  onEdit: (id: string) => void;
  onDelete: (level: Level) => void;
  onToggleStatus: (level: Level) => void;
  onNavigate: (id: string) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export function LevelCard({
  level,
  onEdit,
  onDelete,
  onToggleStatus,
  onNavigate,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
}: LevelCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 p-5 flex flex-col justify-between group cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 rotate-1 scale-105 shadow-2xl border-indigo-400' : ''
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
              <Target className="h-5 w-5 text-indigo-500" />
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
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Recompensa</span>
            <span className="text-sm font-semibold text-amber-600">{level.xpReward} XP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Aprovação</span>
            <span className="text-sm font-semibold text-slate-700">{level.passingPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <span className="font-semibold text-slate-600">{level.questionsCount ?? 0}</span>
          <span>questões</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(level.id)}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 text-xs"
        >
          Gerenciar Questões <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
