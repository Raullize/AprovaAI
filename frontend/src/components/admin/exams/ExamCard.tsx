import { ChevronRight, GripVertical } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EntityCardActions } from '@/components/admin/shared/EntityCardActions';
import { type Exam } from '@/services/exams.service';
import { getIconOption, getColorOption } from '@/config/examThemes';
import { cn } from '@/lib/utils';

interface ExamCardProps {
  exam: Exam;
  onEdit: (id: string) => void;
  onDelete: (exam: Exam) => void;
  onToggleStatus: (exam: Exam) => void;
  onNavigate: (id: string) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export function ExamCard({
  exam,
  onEdit,
  onDelete,
  onToggleStatus,
  onNavigate,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
}: ExamCardProps) {
  const iconOpt = getIconOption(exam.iconKey);
  const colorOpt = getColorOption(exam.colorScheme);
  const Icon = iconOpt.Icon;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 p-5 flex flex-col justify-between group cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'opacity-50 rotate-1 scale-105 shadow-2xl border-indigo-400'
          : ''
      }`}
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
            <StatusBadge status={exam.status} />
          </div>
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <EntityCardActions
              status={exam.status}
              onToggleStatus={() => onToggleStatus(exam)}
              onEdit={() => onEdit(exam.id)}
              onDelete={() => onDelete(exam)}
            />
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1.5 leading-snug">
          {exam.name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
          {exam.description || 'Sem descrição.'}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <span className="font-semibold text-slate-600">
            {exam.topicsCount ?? 0}
          </span>
          <span>tópicos</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(exam.id)}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 text-xs"
        >
          Ver Tópicos <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
