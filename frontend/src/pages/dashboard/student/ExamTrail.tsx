import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Zap,
  Lock,
  Star,
  Trophy,
  ChevronRight,
  PlayCircle,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getIconOption, getColorOption } from '../../../config/examThemes';

import api from '../../../services/api';
import Loading from '../../../components/ui/Loading';

// --- HEX Colors ---
const HEX_COLORS: Record<string, string> = {
  indigo: '#4f46e5',
  emerald: '#10b981',
  orange: '#f97316',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  rose: '#f43f5e',
  amber: '#f59e0b',
  slate: '#475569',
};

// --- Sub-components ---

const StarRating = ({ stars }: { stars: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3].map((s) => (
      <Star
        key={s}
        className={cn(
          'h-3.5 w-3.5',
          s <= stars
            ? 'text-amber-400 fill-amber-400'
            : 'text-slate-300 fill-slate-300',
        )}
      />
    ))}
  </div>
);

const COLOR_THEMES: Record<
  string,
  {
    bgLight: string;
    borderLight: string;
    textDark: string;
    buttonBg: string;
    buttonBorder: string;
  }
> = {
  indigo: {
    bgLight: 'bg-indigo-50/80',
    borderLight: 'border-indigo-150',
    textDark: 'text-indigo-750',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
    buttonBorder: 'border-indigo-800',
  },
  emerald: {
    bgLight: 'bg-emerald-50/80',
    borderLight: 'border-emerald-150',
    textDark: 'text-emerald-700',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    buttonBorder: 'border-emerald-800',
  },
  orange: {
    bgLight: 'bg-orange-50/80',
    borderLight: 'border-orange-150',
    textDark: 'text-orange-700',
    buttonBg: 'bg-orange-600 hover:bg-orange-700',
    buttonBorder: 'border-orange-800',
  },
  sky: {
    bgLight: 'bg-sky-50/80',
    borderLight: 'border-sky-150',
    textDark: 'text-sky-700',
    buttonBg: 'bg-sky-600 hover:bg-sky-700',
    buttonBorder: 'border-sky-800',
  },
  violet: {
    bgLight: 'bg-violet-50/80',
    borderLight: 'border-violet-150',
    textDark: 'text-violet-750',
    buttonBg: 'bg-violet-600 hover:bg-violet-700',
    buttonBorder: 'border-violet-800',
  },
  rose: {
    bgLight: 'bg-rose-50/80',
    borderLight: 'border-rose-150',
    textDark: 'text-rose-700',
    buttonBg: 'bg-rose-600 hover:bg-rose-700',
    buttonBorder: 'border-rose-800',
  },
  amber: {
    bgLight: 'bg-amber-50/80',
    borderLight: 'border-amber-150',
    textDark: 'text-amber-705',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
    buttonBorder: 'border-amber-800',
  },
  slate: {
    bgLight: 'bg-slate-100/80',
    borderLight: 'border-slate-300',
    textDark: 'text-slate-800',
    buttonBg: 'bg-slate-700 hover:bg-slate-800',
    buttonBorder: 'border-slate-900',
  },
};

interface LevelData {
  id: string;
  name: string;
  description?: string;
  xpReward: number;
  questionsCount: number;
  order: number;
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED';
  stars?: number;
  attempted?: boolean;
  simulationMode: 'PRACTICE' | 'EXAM';
}

interface TopicData {
  id: string;
  name: string;
  iconKey: string;
  colorScheme: string;
  levels: LevelData[];
}

const LevelNodeTimeline = ({
  level,
  topic,
  onStart,
  isLast,
}: {
  level: LevelData;
  topic: TopicData;
  onStart: (level: LevelData) => void;
  isLast: boolean;
}) => {
  const isCompleted = level.status === 'COMPLETED';
  const isCurrent = level.status === 'CURRENT';
  const isLocked = level.status === 'LOCKED';
  const side = level.order % 2 === 0 ? 'right' : 'left';
  const colorOpt = getColorOption(topic.colorScheme);
  const theme = COLOR_THEMES[topic.colorScheme] || COLOR_THEMES.indigo;

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
            stroke={
              isCompleted
                ? HEX_COLORS[topic.colorScheme] || '#4f46e5'
                : '#e2e8f0'
            }
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={isCompleted ? 'none' : '6,6'}
          />
        </svg>
      )}

      {/* Desktop Rich Card (Left or Right) */}
      <div
        className={cn(
          'hidden lg:block absolute w-[calc(50%-5rem)] xl:w-[calc(50%-6rem)] group transition-all duration-300',
          side === 'left'
            ? 'right-1/2 mr-10 xl:mr-14 text-right'
            : 'left-1/2 ml-10 xl:ml-14 text-left',
        )}
      >
        <div
          className={cn(
            'p-6 rounded-3xl shadow-sm border transition-all duration-300',
            isCurrent
              ? cn(theme.bgLight, theme.borderLight, 'shadow-md scale-105')
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
                isCurrent ? theme.textDark : 'text-slate-800',
              )}
            >
              {level.name}
            </h3>
            {level.description && (
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                {level.description}
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
                {level.xpReward} XP
              </div>
              <div className="text-slate-400 font-medium text-sm flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" />
                {level.questionsCount} questões
              </div>
            </div>

            {isCurrent && (
              <button
                onClick={() => onStart(level)}
                className={cn(
                  'mt-4 flex items-center gap-2 text-white font-bold px-6 py-3 rounded-2xl shadow-md border-b-4 hover:-translate-y-0.5 active:translate-y-0 active:border-b-0 transition-all',
                  theme.buttonBg,
                  theme.buttonBorder,
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
                ? cn(theme.bgLight, theme.borderLight)
                : 'bg-white border-slate-200',
            )}
          >
            <p
              className={cn(
                'font-bold mb-0.5 leading-tight',
                isCurrent ? theme.textDark : 'text-slate-700',
              )}
            >
              {level.name}
            </p>
            <div
              className={cn(
                'flex items-center gap-1 mt-1.5 font-bold',
                colorOpt.text,
              )}
            >
              <Zap className="h-3 w-3 fill-current" />
              {level.xpReward} XP
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
            {level.name}
          </div>
        )}
      </div>

      {/* The Central Node */}
      <div className="relative z-20">
        {isCompleted && (
          <button
            onClick={() => onStart(level)}
            className={cn(
              'w-16 h-16 lg:w-20 lg:h-20 rounded-full flex flex-col items-center justify-center shadow-md transition-all hover:scale-105 bg-gradient-to-br ring-4 lg:ring-[6px] relative',
              colorOpt.gradient,
              colorOpt.ring,
            )}
          >
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity" />
            <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-white mb-0.5 relative z-10" />
            <div className="relative z-10">
              <StarRating stars={level.stars!} />
            </div>
          </button>
        )}

        {isCurrent && (
          <div className="relative flex flex-col items-center gap-3">
            <div
              className={cn(
                'absolute inset-0 rounded-full animate-ping scale-[1.3] lg:scale-150 opacity-30',
                colorOpt.bg,
              )}
            />
            <button
              onClick={() => onStart(level)}
              className={cn(
                'relative w-20 h-20 lg:w-24 lg:h-24 rounded-full flex flex-col items-center justify-center bg-gradient-to-br shadow-xl hover:scale-105 transition-all active:scale-95 ring-4 lg:ring-[6px]',
                colorOpt.gradient,
                colorOpt.ring,
              )}
            >
              <Star
                className={cn(
                  'text-white fill-white/80 transition-all',
                  level.attempted
                    ? 'h-6 w-6 lg:h-8 lg:w-8 mb-0.5'
                    : 'h-8 w-8 lg:h-10 lg:w-10',
                )}
              />
              {level.attempted && (
                <div className="relative z-10">
                  <StarRating stars={level.stars || 0} />
                </div>
              )}
            </button>
            <button
              onClick={() => onStart(level)}
              className={cn(
                'lg:hidden relative z-10 text-white text-sm font-bold px-6 py-2.5 rounded-2xl shadow-md active:translate-y-1 transition-all bg-gradient-to-br',
                colorOpt.gradient,
              )}
            >
              {level.attempted ? 'TENTAR NOVAMENTE' : 'INICIAR'}
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

// --- Main Component ---
export default function ExamTrail() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);


  useEffect(() => {
    async function loadTrail() {
      try {
        setIsLoading(true);
        const examRes = await api.get(`/exams/${examId}`);
        setExam(examRes.data);

        const topicsRes = await api.get(`/topics/exam/${examRes.data.id}`);
        const topicsData = topicsRes.data;

        const topicsWithLevels = await Promise.all(
          topicsData.map(async (topic: any) => {
            const levelsRes = await api.get(`/levels/topic/${topic.id}`);
            return {
              ...topic,
              levels: levelsRes.data.sort((a: any, b: any) => a.order - b.order),
            };
          })
        );

        topicsWithLevels.sort((a: any, b: any) => a.order - b.order);
        setTopics(topicsWithLevels);
        if (topicsWithLevels.length > 0) {
          setExpandedTopic(topicsWithLevels[0].id);
        }

        const historyRes = await api.get('/simulations/history');
        setHistory(historyRes.data || []);
      } catch (err) {
        console.error('Failed to load trail:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (examId) {
      loadTrail();
    }
  }, [examId]);

  // Ensure scroll top on topic change in desktop
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [expandedTopic]);

  if (isLoading) {
    return <Loading />;
  }

  // Build lock status map
  const allLevels = topics.flatMap((t) => t.levels);
  const levelStatusMap: Record<
    string,
    { stars: number; passed: boolean; attempted: boolean; status: 'COMPLETED' | 'CURRENT' | 'LOCKED' }
  > = {};

  let previousPassed = true;

  allLevels.forEach((lvl) => {
    const lvlHistory = history.filter(
      (h) => h.levelId === lvl.id && h.status === 'COMPLETED',
    );
    const passed = lvlHistory.some((h) => h.passed);
    const attempted = lvlHistory.length > 0;
    const maxStars = lvlHistory.reduce((max, h) => {
      const s = h.stars ?? 0;
      return s > max ? s : max;
    }, 0);

    let status: 'COMPLETED' | 'CURRENT' | 'LOCKED' = 'LOCKED';
    if (passed) {
      status = 'COMPLETED';
    } else if (previousPassed) {
      status = 'CURRENT';
    }

    levelStatusMap[lvl.id] = {
      stars: maxStars,
      passed,
      attempted,
      status,
    };

    previousPassed = passed;
  });

  const mappedTopics: TopicData[] = topics.map((t) => ({
    ...t,
    levels: t.levels.map((l: any) => ({
      ...l,
      status: levelStatusMap[l.id]?.status || 'LOCKED',
      stars: levelStatusMap[l.id]?.stars || 0,
      attempted: levelStatusMap[l.id]?.attempted || false,
      questionsCount: l.questionsCount || 10,
    })),
  }));

  const activeTopicObj: TopicData =
    mappedTopics.find((t) => t.id === expandedTopic) || mappedTopics[0];
  const totalCompleted = mappedTopics.reduce(
    (acc: number, t: TopicData) => acc + t.levels.filter((l: LevelData) => l.status === 'COMPLETED').length,
    0,
  );
  const totalLevels = mappedTopics.reduce((acc: number, t: TopicData) => acc + t.levels.length, 0);
  const globalProgress = totalLevels > 0 ? (totalCompleted / totalLevels) * 100 : 0;

  const handleStartLevel = (level: LevelData) => {
    navigate(`/dashboard/simulations/engine/${level.id}?mode=${level.simulationMode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 py-8 pb-32">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/explore')}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Catálogo
          </button>
        </div>

        {/* Mobile-only Exam Info Card */}
        <div className="lg:hidden bg-white p-5 rounded-3xl shadow-sm border border-slate-200 text-center mb-6">
          <div className="flex items-center gap-4 text-left">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 bg-gradient-to-br",
              getColorOption(exam?.colorScheme || 'orange').gradient
            )}>
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-800 font-display truncate">
                {exam?.name || 'AWS Cloud Practitioner'}
              </h1>
              <p className="text-slate-500 font-medium text-xs mt-0.5">
                {exam?.category === 'OAB' ? 'Exame da Ordem' : 'Trilha de Certificação'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-none">
                Progresso
              </span>
              <span className="text-sm font-bold text-indigo-600 leading-tight block mt-0.5">
                {totalCompleted}/{totalLevels}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* --- LEFT COLUMN: DESKTOP SIDEBAR --- */}
          <div className="hidden lg:block col-span-4 relative">
            <div className="sticky top-24 space-y-6">
              {/* Exam Info Card */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner bg-gradient-to-br",
                  getColorOption(exam?.colorScheme || 'orange').gradient
                )}>
                  <PlayCircle className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 font-display">
                  {exam?.name || 'AWS Cloud Practitioner'}
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  {exam?.category === 'OAB' ? 'Exame da Ordem' : 'Trilha de Certificação'}
                </p>

                <div className="mt-6 text-left">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Progresso Global
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {totalCompleted}/{totalLevels}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${globalProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Topic List */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                    Tópicos do Exame
                  </h2>
                </div>
                <div className="p-2 space-y-1">
                  {mappedTopics.map((topic: any) => {
                    const isActive = expandedTopic === topic.id;
                    const completed = topic.levels.filter(
                      (l: any) => l.status === 'COMPLETED',
                    ).length;
                    const iconOpt = getIconOption(topic.iconKey);
                    const colorOpt = getColorOption(topic.colorScheme);
                    const TopicIcon = iconOpt.Icon;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setExpandedTopic(topic.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group',
                          isActive ? 'bg-indigo-50' : 'hover:bg-slate-50',
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gradient-to-br',
                            isActive
                              ? colorOpt.gradient
                              : 'bg-slate-100 group-hover:bg-slate-200',
                          )}
                        >
                          <TopicIcon
                            className={cn(
                              'h-5 w-5',
                              isActive ? 'text-white' : 'text-slate-500',
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'font-bold truncate text-sm transition-colors',
                              isActive ? 'text-indigo-900' : 'text-slate-700',
                            )}
                          >
                            {topic.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {completed}/{topic.levels.length} concluídos
                          </p>
                        </div>
                        <ChevronRight
                          className={cn(
                            'h-5 w-5 transition-transform',
                            isActive
                              ? 'text-indigo-500 translate-x-1'
                              : 'text-slate-300',
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: THE TRAIL --- */}
          <div className="col-span-12 lg:col-span-8">
            {/* Mobile Continuous Trail View */}
            <div className="lg:hidden space-y-12">
              {mappedTopics.map((topic: TopicData) => {
                const completedCount = topic.levels.filter(
                  (l: LevelData) => l.status === 'COMPLETED',
                ).length;
                const iconOpt = getIconOption(topic.iconKey);
                const colorOpt = getColorOption(topic.colorScheme);
                const MobIcon = iconOpt.Icon;

                return (
                  <div key={topic.id} className="space-y-6">
                    {/* Header divider of the topic */}
                    <div className="mx-2 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shadow-inner',
                            colorOpt.gradient,
                          )}
                        >
                          <MobIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">
                            {topic.name}
                          </h4>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {completedCount}/{topic.levels.length} concluídos
                          </p>
                        </div>
                      </div>
                      <div className="w-20">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full bg-gradient-to-r',
                              colorOpt.gradient,
                            )}
                            style={{
                              width: `${(completedCount / topic.levels.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Levels list (continuous timeline) */}
                    <div className="flex flex-col items-center py-4">
                      {topic.levels.map((level: LevelData, idx: number) => (
                        <LevelNodeTimeline
                          key={level.id}
                          level={level}
                          topic={topic}
                          onStart={handleStartLevel}
                          isLast={idx === topic.levels.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Timeline View */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10 min-h-[800px]">
              <div className="mb-12 text-center">
                <div
                  className={cn(
                    'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br',
                    getColorOption(activeTopicObj.colorScheme).gradient,
                  )}
                >
                  {(() => {
                    const I = getIconOption(activeTopicObj.iconKey).Icon;
                    return <I className="h-8 w-8 text-white" />;
                  })()}
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">
                  {activeTopicObj.name}
                </h2>
                <p className="text-slate-500 text-lg">
                  Continue sua jornada de aprendizado
                </p>
              </div>

              <div className="flex flex-col items-center py-8">
                {activeTopicObj.levels.map((level: LevelData, idx: number) => (
                  <LevelNodeTimeline
                    key={level.id}
                    level={level}
                    topic={activeTopicObj}
                    onStart={handleStartLevel}
                    isLast={idx === activeTopicObj.levels.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
