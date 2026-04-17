import { ImageIcon } from 'lucide-react';
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
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all p-6 flex flex-col justify-between group ${
        isDragging ? 'opacity-40 scale-95' : ''
      }`}
    >
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          {/* Left: number + status */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
              {index + 1}
            </span>
            <StatusBadge status={question.status} />
          </div>

          {/* Right: grip + actions */}
          <div className="flex items-center gap-0.5">
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
          <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center h-28">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Imagem da questão"
                className="max-h-full object-contain"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-300" />
            )}
          </div>
        )}

        {/* Content */}
        <p className="text-sm text-gray-800 mb-3 line-clamp-3">
          {question.content}
        </p>

        {/* Type badge */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColor}`}
        >
          {typeLabel}
        </span>

        {/* Options preview */}
        <ul className="mt-3 space-y-1">
          {question.options.map((opt, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center ${
                  opt.isCorrect
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-300'
                }`}
              />
              <span
                className={
                  opt.isCorrect
                    ? 'text-green-800 font-medium line-clamp-1'
                    : 'text-gray-600 line-clamp-1'
                }
              >
                {opt.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>{question.options.length} alternativas</span>
        <span>
          {correctCount} correta{correctCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
