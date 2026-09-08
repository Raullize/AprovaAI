import { ChevronRight, GripVertical, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EntityCardActions } from '@/components/admin/shared/EntityCardActions';
import { type Topic } from '@/services/topics.service';
import { getIconOption, getColorOption } from '@/config/examThemes';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  onEdit: (id: string) => void;
  onDelete: (topic: Topic) => void;
  onToggleStatus: (topic: Topic) => void;
  onNavigate: (id: string) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export function TopicCard({
  topic,
  onEdit,
  onDelete,
  onToggleStatus,
  onNavigate,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
}: TopicCardProps) {
  const iconOpt = getIconOption(topic.iconKey);
  const colorOpt = getColorOption(topic.colorScheme);
  const Icon = iconOpt.Icon;

  const showWarning =
    topic.status === 'PUBLISHED' && (topic.simulationsCount ?? 0) === 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'bg-white rounded-2xl border p-5 flex flex-col justify-between group cursor-grab active:cursor-grabbing transition-all duration-200',
        showWarning
          ? 'border-amber-300 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 bg-amber-50/5'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10',
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
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br',
                colorOpt.gradient,
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={topic.status} />
              {showWarning && (
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg uppercase tracking-wider animate-pulse">
                  <AlertTriangle className="h-3 w-3 text-amber-500 fill-current" />
                  Sem Simulados
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <EntityCardActions
              status={topic.status}
              onToggleStatus={() => onToggleStatus(topic)}
              onEdit={() => onEdit(topic.id)}
              onDelete={() => onDelete(topic)}
            />
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1.5 leading-snug">
          {topic.name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
          {topic.description || 'Sem descrição.'}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <span className="font-semibold text-slate-600">
            {topic.simulationsCount ?? 0}
          </span>
          <span>simulados</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(topic.id)}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 text-xs"
        >
          Ver Simulados <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
