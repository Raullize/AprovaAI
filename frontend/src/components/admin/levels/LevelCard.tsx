import { ChevronRight } from 'lucide-react';
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
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col justify-between group ${
        isDragging ? 'opacity-40 scale-95' : ''
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <StatusBadge status={level.status} />
          <EntityCardActions
            status={level.status}
            onToggleStatus={() => onToggleStatus(level)}
            onEdit={() => onEdit(level.id)}
            onDelete={() => onDelete(level)}
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{level.name}</h3>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">XP:</span>
            <span className="font-medium text-gray-900">
              {level.xpReward} XP
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Aprovação Mínima:</span>
            <span className="font-medium text-gray-900">
              {level.passingPercentage}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Questões:</span>
            <span className="font-medium text-gray-900">
              {level.questionsCount ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(level.id)}
          className="w-full text-primary-600 border-primary-200 hover:bg-primary-50"
        >
          Gerenciar Questões <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
