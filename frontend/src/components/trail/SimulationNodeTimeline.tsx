import React from 'react';
import { Zap, Lock, Star, Trophy, PlayCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getColorOption } from '../../config/examThemes';
import StarRating from '../ui/StarRating';
import type { SimulationMode } from '../../types/simulation.types';

export interface SimulationData {
  id: string;
  name: string;
  description?: string;
  xpReward: number;
  questionsCount: number;
  order: number;
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED';
  stars?: number;
  attempted?: boolean;
  simulationMode: SimulationMode;
  timeLimit?: number | null;
  passingPercentage?: number;
}

export interface TopicData {
  id: string;
  name: string;
  iconKey: string;
  colorScheme: string;
  showComingSoon?: boolean;
  simulations: SimulationData[];
}

interface SimulationNodeTimelineProps {
  simulation: SimulationData;
  topic: TopicData;
  onStart: (simulation: SimulationData, topic: TopicData) => void;
  isLast: boolean;
}

const SimulationNodeTimeline: React.FC<SimulationNodeTimelineProps> = ({
  simulation,
  topic,
  onStart,
  isLast,
}) => {
  const isCompleted = simulation.status === 'COMPLETED';
  const isCurrent = simulation.status === 'CURRENT';
  const isLocked = simulation.status === 'LOCKED';
  const side = simulation.order % 2 === 0 ? 'right' : 'left';
  const colorOpt = getColorOption(topic.colorScheme);

  return (
    <div className="relative flex justify-center items-center w-full min-h-[140px] lg:min-h-[180px] py-4">
      {/* Central Curved SVG Line */}
      {!isLast && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute top-[50%] left-1/2 -translate-x-1/2 w-24 h-[140px] lg:h-[180px] z-10 pointer-events-none"
          style={{ height: '100%', top: '50%' }}
        >
          <path
            d={
              side === 'left'
                ? 'M 50 0 C 85 25, 85 75, 50 100'
                : 'M 50 0 C 15 25, 15 75, 50 100'
            }
            fill="none"
            stroke={isCompleted ? colorOpt.hex : '#e2e8f0'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={isCompleted ? 'none' : '6,6'}
          />
        </svg>
      )}

      {/* Desktop Rich Card (Left or Right) */}
      <div
        className={cn(
          'hidden lg:block absolute z-30 w-[calc(50%-7rem)] xl:w-[calc(50%-8rem)] group transition-all duration-300',
          side === 'left'
            ? 'right-1/2 mr-16 xl:mr-20 text-right'
            : 'left-1/2 ml-16 xl:ml-20 text-left',
        )}
      >
        <div
          className={cn(
            'p-4 lg:p-5 rounded-3xl shadow-sm border transition-all duration-300',
            isCurrent
              ? cn(colorOpt.bgLight, colorOpt.borderLight, 'shadow-md scale-105')
              : 'bg-white border-slate-200 hover:shadow-md',
            isLocked && 'opacity-60 grayscale hover:grayscale-0',
          )}
        >
          <div
            className={cn(
              'flex flex-col gap-2',
              side === 'left' && 'items-end',
            )}
          >
            <h3
              className={cn(
                'text-xl font-bold font-display',
                isCurrent ? colorOpt.textDark : 'text-slate-800',
              )}
            >
              {simulation.name}
            </h3>
            {simulation.description && (
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                {simulation.description}
              </p>
            )}

            <div
              className={cn(
                'flex items-center gap-4 mt-2',
                side === 'left' && 'flex-row-reverse',
              )}
            >
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 font-bold text-sm">
                <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                {simulation.xpReward} XP
              </div>
              <div className="text-slate-400 font-medium text-sm flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" />
                {simulation.questionsCount} questões
              </div>
            </div>

            {isCurrent && (
              <button
                onClick={() => onStart(simulation, topic)}
                className={cn(
                  'mt-4 flex items-center gap-2 text-white font-bold px-6 py-3 rounded-2xl shadow-md border-b-4 hover:-translate-y-0.5 active:translate-y-0 active:border-b-0 transition-all',
                  colorOpt.buttonBg,
                  colorOpt.buttonBorder,
                )}
              >
                <PlayCircle className="h-5 w-5" />
                INICIAR AGORA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tooltip (like old layout) */}
      <div
        className={cn(
          'absolute lg:hidden max-w-[140px] z-10 pointer-events-none transition-opacity',
          side === 'left' ? 'right-[calc(50%+40px)]' : 'left-[calc(50%+40px)]',
        )}
      >
        {(isCompleted || isCurrent) && (
          <div
            className={cn(
              'rounded-xl p-2.5 text-xs shadow-sm border',
              isCurrent
                ? cn(colorOpt.bgLight, colorOpt.borderLight)
                : 'bg-white border-slate-200',
            )}
          >
            <p
              className={cn(
                'font-bold mb-0.5 leading-tight',
                isCurrent ? colorOpt.textDark : 'text-slate-700',
              )}
            >
              {simulation.name}
            </p>
            <div
              className={cn(
                'flex items-center gap-1 mt-1.5 font-bold',
                colorOpt.text,
              )}
            >
              <Zap className="h-3 w-3 fill-current" />
              {simulation.xpReward} XP
            </div>
          </div>
        )}
        {isLocked && (
          <div
            className={cn(
              'text-xs font-bold text-slate-400',
              side === 'left' ? 'text-right' : 'text-left',
            )}
          >
            {simulation.name}
          </div>
        )}
      </div>

      {/* The Central Node */}
      <div className="relative z-40">
        {isCompleted && (
          <button
            onClick={() => onStart(simulation, topic)}
            className={cn(
              'w-16 h-16 lg:w-20 lg:h-20 rounded-full flex flex-col items-center justify-center shadow-md transition-all hover:scale-105 bg-gradient-to-br ring-4 lg:ring-[6px] relative',
              colorOpt.gradient,
              colorOpt.ring,
            )}
          >
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity" />
            <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-white mb-0.5 relative z-10" />
            <div className="relative z-10">
              <StarRating stars={simulation.stars!} />
            </div>
          </button>
        )}

        {isCurrent && (
          <div className="relative flex flex-col items-center gap-3">
            <div
              className={cn(
                'absolute inset-0 rounded-full animate-ping scale-[1.3] lg:scale-150 opacity-30 pointer-events-none',
                colorOpt.bg,
              )}
            />
            <button
              onClick={() => onStart(simulation, topic)}
              className={cn(
                'relative w-20 h-20 lg:w-24 lg:h-24 rounded-full flex flex-col items-center justify-center bg-gradient-to-br shadow-xl hover:scale-105 transition-all active:scale-95 ring-4 lg:ring-[6px]',
                colorOpt.gradient,
                colorOpt.ring,
              )}
            >
              <Star
                className={cn(
                  'text-white fill-white/80 transition-all',
                  simulation.attempted
                    ? 'h-6 w-6 lg:h-8 lg:w-8 mb-0.5'
                    : 'h-8 w-8 lg:h-10 lg:w-10',
                )}
              />
              {simulation.attempted && (
                <div className="relative z-10">
                  <StarRating stars={simulation.stars || 0} />
                </div>
              )}
            </button>
            <button
              onClick={() => onStart(simulation, topic)}
              className={cn(
                'lg:hidden relative z-10 text-white text-sm font-bold px-6 py-2.5 rounded-2xl shadow-md active:translate-y-1 transition-all bg-gradient-to-br',
                colorOpt.gradient,
              )}
            >
              {simulation.attempted ? 'TENTAR NOVAMENTE' : 'INICIAR'}
            </button>
          </div>
        )}

        {isLocked && (
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-slate-200 ring-4 lg:ring-[6px] ring-slate-100 cursor-not-allowed">
            <Lock className="h-6 w-6 lg:h-8 lg:w-8 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationNodeTimeline;
