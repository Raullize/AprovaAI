import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';

export interface ReviewOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ReviewQuestion {
  id: string;
  text: string;
  explanation: string;
  options: ReviewOption[];
  studyLink?: string;
  imageUrl?: string | null;
  type?: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
}

export interface ReviewAnswer {
  questionId: string;
  selectedId: string;
  selectedIds?: string[];
  correct: boolean;
  originalIndex?: number;
}

export function getOptionLabel(index: number): string {
  return ['A', 'B', 'C', 'D', 'E'][index] ?? String(index + 1);
}

function resolveImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http')) return imageUrl;
  const baseUrl = import.meta.env.VITE_STATIC_URL || 'http://localhost:3001';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

interface ReviewQuestionCardProps {
  answer: ReviewAnswer;
  question: ReviewQuestion;
  questionNumber: number;
}

export function ReviewQuestionCard({
  answer,
  question,
  questionNumber,
}: ReviewQuestionCardProps) {
  return (
    <Card padding="normal" className="space-y-4 text-left">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        {answer.correct ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
        )}
        <div className="min-w-0">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            Questão {questionNumber}
            {answer.correct ? (
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Você acertou
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                Você errou
              </span>
            )}
          </h4>
          <p className="text-slate-650 text-sm mt-1.5 leading-relaxed">
            {question.text}
          </p>

          {question.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[220px]">
              <img
                src={resolveImageUrl(question.imageUrl)}
                alt="Imagem da questão"
                className="max-h-[220px] object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2 pl-8">
        {question.options.map((option, optionIndex) => {
          const isSelected = answer.selectedIds
            ? answer.selectedIds.includes(option.id)
            : option.id === answer.selectedId;
          const isCorrect = option.isCorrect;

          let optionStyle =
            'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
          let badge = null;

          if (isSelected && isCorrect) {
            optionStyle =
              'border-emerald-500 bg-emerald-50 text-emerald-955 font-medium shadow-sm';
            badge = (
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                Sua resposta
              </span>
            );
          } else if (!isSelected && isCorrect) {
            optionStyle =
              'border-dashed border-emerald-400 bg-emerald-50/30 text-emerald-800 font-medium';
            badge = (
              <span className="text-[10px] font-semibold bg-slate-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
                Gabarito
              </span>
            );
          } else if (isSelected && !isCorrect) {
            optionStyle =
              'border-rose-400 bg-rose-50 text-rose-900 font-medium';
            badge = (
              <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full shrink-0">
                Sua resposta (incorreta)
              </span>
            );
          }

          return (
            <div
              key={option.id}
              className={cn(
                'flex items-start justify-between gap-2.5 p-3 rounded-2xl border text-xs leading-relaxed transition-all',
                optionStyle,
              )}
            >
              <div className="flex items-start gap-2.5 flex-1">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0 border border-current mt-0.5">
                  {getOptionLabel(optionIndex)}
                </span>
                <span className="text-slate-700 font-medium">
                  {option.text}
                </span>
              </div>
              {badge}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed space-y-2">
        <div>
          <span className="font-bold text-slate-700 block mb-1">
            Explicação:
          </span>
          {question.explanation}
        </div>
        {question.studyLink && (
          <div className="pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-700">
              Link de Aprofundamento:{' '}
            </span>
            <a
              href={question.studyLink}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline font-medium"
            >
              {question.studyLink}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
