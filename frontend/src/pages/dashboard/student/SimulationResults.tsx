import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  Home,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// --- Types ---
interface AnswerRecord {
  questionId: string;
  selectedId: string;
  correct: boolean;
}

interface ResultsState {
  answers: AnswerRecord[];
  total: number;
  correct: number;
  timeSpent: number;
  xpEarned: number;
  passingPercentage: number;
  levelName: string;
}

// --- Default fallback mock (accessed directly, no navigation state) ---
const FALLBACK: ResultsState = {
  answers: [],
  total: 5,
  correct: 4,
  timeSpent: 312,
  xpEarned: 48,
  passingPercentage: 70,
  levelName: 'Organização do Estado',
};

// --- Utility ---
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

// --- Animated counter hook ---
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 30;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// --- Star display ---
function getStars(percentage: number): number {
  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
}

// --- Main Component ---
export default function SimulationResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ResultsState) || FALLBACK;

  const { total, correct, timeSpent, xpEarned, passingPercentage, levelName } = state;

  const percentage = Math.round((correct / total) * 100);
  const passed = percentage >= passingPercentage;
  const stars = getStars(percentage);
  const wrong = total - correct;

  const animatedXP = useCountUp(xpEarned);
  const animatedPercentage = useCountUp(percentage);

  const [showReview, setShowReview] = useState(false);

  // Confetti colors (CSS-only burst)
  const confettiItems = Array.from({ length: 20 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-24">
      {/* Hero section */}
      <div
        className={cn(
          'relative overflow-hidden pt-12 pb-10 px-4 text-center',
          passed
            ? 'bg-gradient-to-b from-indigo-600 to-violet-600'
            : 'bg-gradient-to-b from-slate-700 to-slate-800',
        )}
      >
        {/* Confetti dots for success */}
        {passed &&
          confettiItems.map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa'][i % 5],
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${1 + Math.random()}s`,
                opacity: 0.7,
              }}
            />
          ))}

        {/* Trophy */}
        <div className="relative z-10 mb-4">
          <div
            className={cn(
              'w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-2xl',
              passed ? 'bg-amber-400 shadow-amber-500/40' : 'bg-slate-600 shadow-slate-500/40',
            )}
          >
            {passed ? (
              <Trophy className="h-12 w-12 text-white" />
            ) : (
              <RotateCcw className="h-12 w-12 text-white" />
            )}
          </div>

          {/* Stars */}
          {passed && (
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    'h-8 w-8 transition-all',
                    s <= stars
                      ? 'text-amber-400 fill-amber-400 scale-110'
                      : 'text-white/30 fill-white/20',
                  )}
                  style={{
                    animationDelay: `${s * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-display">
            {passed ? 'Nível Concluído!' : 'Continue Tentando!'}
          </h1>
          <p className="text-white/70 mt-1.5 text-sm">
            {levelName}
          </p>
          <p className="text-white/60 text-xs mt-1">
            {passed
              ? stars === 3
                ? 'Desempenho perfeito! 🌟'
                : 'Parabéns pela aprovação!'
              : `Você precisava de ${passingPercentage}% para passar.`}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {/* Acertos */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{correct}</p>
            <p className="text-xs text-slate-500 mt-0.5">Acertos</p>
          </div>

          {/* Erros */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 text-center">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{wrong}</p>
            <p className="text-xs text-slate-500 mt-0.5">Erros</p>
          </div>

          {/* XP */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 text-center">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-600">+{animatedXP}</p>
            <p className="text-xs text-slate-500 mt-0.5">XP Ganho</p>
          </div>
        </div>

        {/* Score & time */}
        <div className="mt-3 grid grid-cols-2 gap-3 max-w-md mx-auto">
          {/* Score bar */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 col-span-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 font-medium">Aproveitamento</span>
              <span
                className={cn(
                  'text-sm font-bold',
                  passed ? 'text-green-600' : 'text-red-500',
                )}
              >
                {animatedPercentage}%
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  passed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500',
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400">0%</span>
              <span className="text-[10px] text-slate-400">
                Mínimo: {passingPercentage}%
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-base font-bold text-slate-700">
              {timeSpent > 0 ? formatTime(timeSpent) : '—'}
            </p>
            <p className="text-xs text-slate-500">Tempo</p>
          </div>
        </div>
      </div>

      {/* Review section */}
      <div className="px-4 mt-4 max-w-md mx-auto">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <span className="text-sm font-semibold text-slate-700">Revisar Respostas</span>
          {showReview ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {showReview && state.answers.length > 0 && (
          <div className="mt-2 space-y-2">
            {state.answers.map((ans, idx) => (
              <div
                key={ans.questionId}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border text-sm',
                  ans.correct
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200',
                )}
              >
                {ans.correct ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
                <span className={ans.correct ? 'text-green-700' : 'text-red-700'}>
                  Questão {idx + 1} — {ans.correct ? 'Correta' : 'Incorreta'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 space-y-3">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base border-b-4 border-indigo-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Continuar Trilha
          </button>

          {!passed && (
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-base hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
