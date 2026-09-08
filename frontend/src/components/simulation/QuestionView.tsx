import { Flag } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SimulationMode } from '../../types/simulation.types';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Question {
  id: string;
  text: string;
  imageUrl?: string | null;
  explanation: string;
  studyLink?: string;
  options: QuestionOption[];
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
}

type FeedbackState = 'correct' | 'wrong' | null;

interface QuestionViewProps {
  question: Question;
  questionNumber: number;
  selectedOptions: string[];
  feedback: FeedbackState;
  mode: SimulationMode;
  isFlagged: boolean;
  onSelectOption: (optionId: string) => void;
  onToggleFlag: () => void;
}

function resolveImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http')) return imageUrl;
  const baseUrl = import.meta.env.VITE_STATIC_URL || 'http://localhost:3001';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

export function QuestionView({
  question,
  questionNumber,
  selectedOptions,
  feedback,
  mode,
  isFlagged,
  onSelectOption,
  onToggleFlag,
}: QuestionViewProps) {
  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Main Content Area (Questions) */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          {/* Question text */}
          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
                Questão {questionNumber}
              </p>
              {mode === 'EXAM' && (
                <button
                  onClick={onToggleFlag}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
                    isFlagged
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-655 hover:bg-slate-50',
                  )}
                >
                  <Flag
                    className={cn('h-3.5 w-3.5', isFlagged && 'fill-amber-500')}
                  />
                  {isFlagged ? 'Marcada para Revisar' : 'Marcar para Revisar'}
                </button>
              )}
            </div>
            <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed">
              {question.text}
            </p>

            {question.imageUrl && (
              <div className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[300px]">
                <img
                  src={resolveImageUrl(question.imageUrl)}
                  alt="Imagem da questão"
                  className="max-h-[300px] object-contain"
                />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              const isCorrectOption = option.isCorrect;

              let borderClass =
                'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50';
              let bgClass = 'bg-white';
              let labelClass = 'bg-slate-100 text-slate-500';
              let badge = null;

              if (feedback !== null) {
                if (isSelected && isCorrectOption) {
                  borderClass = 'border-green-500';
                  bgClass = 'bg-green-50';
                  labelClass = 'bg-green-500 text-white';
                  badge = (
                    <span className="text-[10px] font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full shrink-0 ml-auto self-center">
                      Você acertou
                    </span>
                  );
                } else if (!isSelected && isCorrectOption) {
                  borderClass = 'border-dashed border-green-400';
                  bgClass = 'bg-green-50/30';
                  labelClass =
                    'border border-dashed border-green-400 text-green-600 bg-green-50';
                  badge = (
                    <span className="text-[10px] font-semibold bg-slate-100 text-green-700 px-2 py-0.5 rounded-full shrink-0 border border-green-200 ml-auto self-center">
                      Gabarito (Não selecionada)
                    </span>
                  );
                } else if (isSelected && !isCorrectOption) {
                  borderClass = 'border-red-400';
                  bgClass = 'bg-red-50';
                  labelClass = 'bg-red-500 text-white';
                  badge = (
                    <span className="text-[10px] font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full shrink-0 ml-auto self-center">
                      Você marcou (Incorreta)
                    </span>
                  );
                } else {
                  borderClass = 'border-slate-200 opacity-60';
                }
              } else if (isSelected) {
                borderClass = 'border-indigo-500';
                bgClass = 'bg-indigo-50';
                labelClass = 'bg-indigo-600 text-white';
              }

              const optionLabel = ['A', 'B', 'C', 'D', 'E'][
                question.options.indexOf(option)
              ];

              return (
                <button
                  key={option.id}
                  disabled={feedback !== null}
                  onClick={() => onSelectOption(option.id)}
                  className={cn(
                    'w-full text-left flex items-start justify-between gap-3 p-4 rounded-2xl border-2 transition-all duration-200',
                    borderClass,
                    bgClass,
                    feedback === null && 'cursor-pointer active:scale-[0.99]',
                  )}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors',
                        labelClass,
                      )}
                    >
                      {optionLabel}
                    </span>
                    <span className="text-sm sm:text-base text-slate-700 font-medium leading-snug pt-0.5">
                      {option.text}
                    </span>
                  </div>
                  {badge}
                </button>
              );
            })}
          </div>

          {/* Explanation (PRACTICE mode after answer) */}
          {feedback !== null && mode === 'PRACTICE' && (
            <div
              className={cn(
                'mt-4 p-4 rounded-2xl text-sm leading-relaxed space-y-2',
                feedback === 'correct'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-orange-50 border border-orange-200 text-orange-800',
              )}
            >
              <div>
                <p className="font-semibold mb-1">Explicação</p>
                <p>{question.explanation}</p>
              </div>
              {question.studyLink && (
                <div className="pt-2 border-t border-slate-200/50">
                  <span className="font-semibold">Link de Aprofundamento:</span>{' '}
                  <a
                    href={question.studyLink}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'underline font-medium',
                      feedback === 'correct'
                        ? 'text-green-700 hover:text-green-900'
                        : 'text-orange-700 hover:text-orange-900',
                    )}
                  >
                    {question.studyLink}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
