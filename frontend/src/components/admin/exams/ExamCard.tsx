import { ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EntityCardActions } from '@/components/admin/shared/EntityCardActions';
import { type Exam } from '@/services/exams.service';

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
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col justify-between group ${
        isDragging ? 'opacity-40 scale-95' : ''
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <StatusBadge status={exam.status} />
          <EntityCardActions
            status={exam.status}
            onToggleStatus={() => onToggleStatus(exam)}
            onEdit={() => onEdit(exam.id)}
            onDelete={() => onDelete(exam)}
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3">
          {exam.description || 'Sem descrição.'}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {exam.topicsCount ?? 0} Tópicos
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(exam.id)}
          className="text-primary-600 border-primary-200 hover:bg-primary-50"
        >
          Ver Tópicos <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
