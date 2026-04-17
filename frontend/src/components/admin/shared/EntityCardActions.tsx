import { Edit2, GripVertical, Lock, Trash2, Unlock } from 'lucide-react';

interface EntityCardActionsProps {
  status: 'ACTIVE' | 'INACTIVE';
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EntityCardActions({
  status,
  onToggleStatus,
  onEdit,
  onDelete,
}: EntityCardActionsProps) {
  const isActive = status === 'ACTIVE';

  return (
    <div className="flex items-center space-x-1">
      <GripVertical className="h-4 w-4 text-gray-300 cursor-grab active:cursor-grabbing mr-1" />

      <button
        onClick={onToggleStatus}
        className={`p-1.5 rounded-md transition-colors ${
          isActive
            ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
        }`}
        title={isActive ? 'Tornar Privado' : 'Tornar Público'}
      >
        {isActive ? (
          <Unlock className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={onEdit}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="Editar"
      >
        <Edit2 className="h-4 w-4" />
      </button>

      <button
        onClick={onDelete}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
