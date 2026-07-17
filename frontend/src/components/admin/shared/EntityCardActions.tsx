import { Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';

interface EntityCardActionsProps {
  status: 'PUBLISHED' | 'DRAFT';
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
  const isActive = status === 'PUBLISHED';

  return (
    <div className="flex items-center space-x-0.5">
      <button
        onClick={onToggleStatus}
        className={`p-1.5 rounded-xl transition-all ${
          isActive
            ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
        }`}
        title={isActive ? 'Mudar para Rascunho' : 'Publicar'}
      >
        {isActive ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>

      <button
        onClick={onEdit}
        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        title="Editar"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={onDelete}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        title="Excluir"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
