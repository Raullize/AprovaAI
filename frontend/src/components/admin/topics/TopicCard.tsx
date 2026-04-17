import { ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EntityCardActions } from '@/components/admin/shared/EntityCardActions';
import { type Topic } from '@/services/topics.service';

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
          <StatusBadge status={topic.status} />
          <EntityCardActions
            status={topic.status}
            onToggleStatus={() => onToggleStatus(topic)}
            onEdit={() => onEdit(topic.id)}
            onDelete={() => onDelete(topic)}
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3">
          {topic.description || 'Sem descrição.'}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {topic.levelsCount ?? 0} Níveis
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(topic.id)}
          className="text-primary-600 border-primary-200 hover:bg-primary-50"
        >
          Ver Níveis <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
