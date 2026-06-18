import { ImageIcon, GripVertical } from 'lucide-react';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EntityCardActions } from '@/components/admin/shared/EntityCardActions';
import { type Question } from '@/services/questions.service';

const BACKEND_URL = 'http://localhost:3001';

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: (q: Question) => void;
  onDelete: (q: Question) => void;
  onToggleStatus: (q: Question) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
}: QuestionCardProps) {
  const normalizedImageUrl = question.imageUrl?.startsWith('/')
    ? question.imageUrl
    : `/${question.imageUrl}`;
  const previewUrl = question.imageUrl?.includes('uploads/')
    ? `${BACKEND_URL}${normalizedImageUrl}`
    : question.imageUrl;

  const correctCount = question.options.filter((o) => o.isCorrect).length;
  const typeLabel =
    question.type === 'SINGLE_CHOICE' ? 'Única Escolha' : 'Múltipla Escolha';
  const typeColor =
    question.type === 'SINGLE_CHOICE'
      ? 'bg-blue-100 text-blue-800 border border-blue-200'
      : 'bg-purple-100 text-purple-800 border border-purple-200';

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
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          {/* Left: number + status */}
          <div className="flex items-center gap-3">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-100 transition-colors">
              {index + 1}
            </span>
            <StatusBadge status={question.status} />
          </div>

          {/* Right: grip + actions */}
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <EntityCardActions
              status={question.status}
              onToggleStatus={() => onToggleStatus(question)}
              onEdit={() => onEdit(question)}
              onDelete={() => onDelete(question)}
            />
          </div>
        </div>

        {/* Image preview */}
        {question.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center h-28">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Imagem da questão"
                className="max-h-full object-contain"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-slate-300" />
            )}
          </div>
        )}

        {/* Content */}
        <p className="text-sm text-slate-800 mb-3 line-clamp-3 leading-relaxed font-medium">
          {question.content}
        </p>

        {/* Type badge */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${typeColor}`}
        >
          {typeLabel}
        </span>

        {/* Options preview */}
        <ul className="mt-4 space-y-1.5">
          {question.options.map((opt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span
                className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center ${
                  opt.isCorrect
                    ? 'border-emerald-500 bg-emerald-100'
                    : 'border-slate-300'
                }`}
              />
              <span
                className={
                  opt.isCorrect
                    ? 'text-emerald-700 font-medium line-clamp-1'
                    : 'text-slate-500 line-clamp-1'
                }
              >
                {opt.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1">
          <span className="text-slate-700 font-bold">
            {question.options.length}
          </span>
          <span>alternativas</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-emerald-600 font-bold">{correctCount}</span>
          <span className="text-emerald-700/80">
            correta{correctCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
