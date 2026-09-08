import {
  Trophy,
  RotateCcw,
  Star,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { formatDuration } from '../../lib/format';

export interface ConfettiItem {
  top: string;
  left: string;
  color: string;
  delay: string;
  duration: string;
}

interface ResultSummaryProps {
  passed: boolean;
  stars: number;
  simulationName: string;
  passingPercentage: number;
  confettiItems: ConfettiItem[];
  animatedCorrect: number;
  animatedWrong: number;
  animatedXP: number;
  animatedPercentage: number;
  barWidth: number;
  timeSpent: number;
}

export function ResultSummary({
  passed,
  stars,
  simulationName,
  passingPercentage,
  confettiItems,
  animatedCorrect,
  animatedWrong,
  animatedXP,
  animatedPercentage,
  barWidth,
  timeSpent,
}: ResultSummaryProps) {
  return (
    <>
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
          confettiItems.map((item, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                top: item.top,
                left: item.left,
                backgroundColor: item.color,
                animationDelay: item.delay,
                animationDuration: item.duration,
                opacity: 0.7,
              }}
            />
          ))}

        {/* Trophy */}
        <div className="relative z-10 mb-4">
          <div
            className={cn(
              'w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-2xl',
              passed
                ? 'bg-amber-400 shadow-amber-500/40'
                : 'bg-slate-600 shadow-slate-500/40',
            )}
          >
            {passed ? (
              <Trophy className="h-12 w-12 text-white" />
            ) : (
              <RotateCcw className="h-12 w-12 text-white" />
            )}
          </div>

          {/* Stars */}
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
        </div>

        {/* Title */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-display">
            {passed ? 'Simulado Concluído!' : 'Continue Tentando!'}
          </h1>
          <p className="text-white/70 mt-1.5 text-sm">{simulationName}</p>
          <p className="text-white/60 text-xs mt-1">
            {passed
              ? stars === 3
                ? 'Desempenho perfeito!'
                : 'Parabéns pela aprovação!'
              : `Você precisava de ${passingPercentage}% para passar.`}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {/* Acertos */}
          <Card padding="small" className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {animatedCorrect}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Acertos</p>
          </Card>

          {/* Erros */}
          <Card padding="small" className="text-center">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{animatedWrong}</p>
            <p className="text-xs text-slate-500 mt-0.5">Erros</p>
          </Card>

          {/* XP */}
          <Card padding="small" className="text-center">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-600">+{animatedXP}</p>
            <p className="text-xs text-slate-500 mt-0.5">XP Ganho</p>
          </Card>
        </div>

        {/* Score & time */}
        <div className="mt-3 grid grid-cols-2 gap-3 max-w-md mx-auto">
          {/* Score bar */}
          <Card padding="small" className="col-span-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 font-medium">
                Aproveitamento
              </span>
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
                  passed
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-red-400 to-rose-500',
                )}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400">0%</span>
              <span className="text-[10px] text-slate-400">
                Mínimo: {passingPercentage}%
              </span>
            </div>
          </Card>

          {/* Time */}
          <Card
            padding="small"
            className="flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-base font-bold text-slate-700">
              {timeSpent > 0 ? formatDuration(timeSpent) : '—'}
            </p>
            <p className="text-xs text-slate-500">Tempo</p>
          </Card>
        </div>
      </div>
    </>
  );
}
