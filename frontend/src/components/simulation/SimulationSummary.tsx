import React from 'react';
import { Clock, Flag } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SimulationMode } from '../../types/simulation.types';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  explanation: string;
  order: number;
}

interface SimulationSummaryProps {
  mode: SimulationMode;
  timerColor: string;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  answers: { questionId: string; selectedId: string; correct: boolean }[];
  questions: Question[];
  flagged: Record<string, boolean>;
  setCurrentIndex: (idx: number) => void;
  setView: (view: 'QUESTION' | 'SUMMARY') => void;
  handleFinish: () => void;
  hasTimeLimit?: boolean;
}

const SimulationSummary: React.FC<SimulationSummaryProps> = ({
  mode,
  timerColor,
  timeLeft,
  formatTime,
  answers,
  questions,
  flagged,
  setCurrentIndex,
  setView,
  handleFinish,
  hasTimeLimit,
}) => {
  const totalQuestions = questions.length;
  const answeredCount = answers.filter((a) => a.selectedId !== '').length;

  return (
    <>
      {/* Summary Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 font-display">
          Revisão do Simulado
        </h2>
        {(mode === 'EXAM' || hasTimeLimit) && (
          <div
            className={cn(
              'flex items-center gap-1.5 font-bold text-sm tabular-nums',
              timerColor,
            )}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Summary Body */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <p className="text-slate-500 text-sm">
              Confira o status de cada questão. Clique no número de qualquer
              questão para retornar a ela e revisar ou alterar sua resposta.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-150 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-650">
                {answeredCount}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Respondidas
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-150 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">
                {Object.values(flagged).filter(Boolean).length}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Para Revisar
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-400">
                {totalQuestions - answeredCount}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Sem Resposta
              </p>
            </div>
          </div>

          {/* Badges grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-4 justify-items-center">
              {questions.map((q, idx) => {
                const isAnswered = answers.some(
                  (a) => a.questionId === q.id && a.selectedId !== '',
                );
                const isFlagged = flagged[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setView('QUESTION');
                    }}
                    className={cn(
                      'w-12 h-12 rounded-2xl font-bold flex items-center justify-center border-2 transition-all relative text-sm',
                      isFlagged
                        ? 'bg-amber-50 border-amber-500 text-amber-700 hover:bg-amber-100/50'
                        : isAnswered
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-750 hover:bg-emerald-100/50'
                          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50',
                    )}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 border border-white rounded-full flex items-center justify-center">
                        <Flag className="w-2.5 h-2.5 text-white fill-current" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-5 mt-6 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-400" />
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-400" />
                <span>Revisar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-white border border-slate-200" />
                <span>Não respondida</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            type="button"
            onClick={() => setView('QUESTION')}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-sm sm:text-base"
          >
            Voltar para a Prova
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 py-4 rounded-2xl font-bold text-white bg-green-600 hover:bg-green-700 border-b-4 border-green-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 shadow-md transition-all text-sm sm:text-base text-center"
          >
            Finalizar Simulado
          </button>
        </div>
      </div>
    </>
  );
};

export default SimulationSummary;
