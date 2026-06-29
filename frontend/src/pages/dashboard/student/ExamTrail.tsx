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
  Clock3,
  Brain,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getIconOption, getColorOption } from '../../../config/examThemes';
import type { SimulationMode } from '../../../types/simulation.types';
import api from '../../../services/api';
import Loading from '../../../components/ui/Loading';
import Modal from '../../../components/ui/Modal';
import EmptyState from '../../../components/ui/EmptyState';
import StarRating from '../../../components/ui/StarRating';
import LevelNodeTimeline, { type LevelData, type TopicData } from '../../../components/trail/LevelNodeTimeline';

const ComingSoonNodeTimeline = () => {
  return (
    <div className="relative flex justify-center items-center w-full min-h-[140px] lg:min-h-[180px] py-4">
      <div className="hidden lg:block absolute left-1/2 ml-16 xl:ml-20 w-[calc(50%-7rem)] xl:w-[calc(50%-8rem)]">
        <div className="p-4 lg:p-5 rounded-3xl border border-dashed border-slate-300 bg-slate-100/80 shadow-sm opacity-80">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold font-display text-slate-600">
              Em breve
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Este tópico ainda vai receber novos níveis. Continue acompanhando a
              trilha para liberar o próximo desafio.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute lg:hidden left-[calc(50%+40px)] max-w-[140px] z-10 pointer-events-none">
        <div className="rounded-xl p-2.5 text-xs shadow-sm border border-dashed border-slate-300 bg-slate-100/80 opacity-80">
          <p className="font-bold mb-0.5 leading-tight text-slate-600">
            Em breve
          </p>
          <p className="text-slate-500 leading-relaxed">
            Novos níveis serão adicionados aqui.
          </p>
        </div>
      </div>

      <div className="relative z-20 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-slate-200 ring-4 lg:ring-[6px] ring-slate-100 shadow-md cursor-not-allowed">
        <Clock3 className="h-6 w-6 lg:h-8 lg:w-8 text-slate-400" />
      </div>
    </div>
  );
};

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return 'Sem limite';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes} min ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes} min`;
  }

  return `${remainingSeconds}s`;
}

// --- Main Component ---
export default function ExamTrail() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [pendingStart, setPendingStart] = useState<{
    level: LevelData;
    topic: TopicData;
  } | null>(null);


  useEffect(() => {
    async function loadTrail() {
      try {
        setIsLoading(true);
        const examRes = await api.get(`/exams/${examId}`);
        setExam(examRes.data);

        const topicsRes = await api.get(`/topics/exam/${examRes.data.id}`);
        const topicsData = topicsRes.data.filter(
          (topic: any) => topic.status === 'ACTIVE',
        );

        const topicsWithLevels = await Promise.all(
          topicsData.map(async (topic: any) => {
            const levelsRes = await api.get(`/levels/topic/${topic.id}`);
            const publicLevels = levelsRes.data
              .filter((level: any) => level.status === 'ACTIVE')
              .sort((a: any, b: any) => a.order - b.order);

            return {
              ...topic,
              levels: publicLevels,
            };
          }),
        );

        const visibleTopics = topicsWithLevels
          .filter(
            (topic: any) =>
              topic.levels.length > 0 || topic.showComingSoon === true,
          )
          .sort((a: any, b: any) => a.order - b.order);

        setTopics(visibleTopics);
        if (visibleTopics.length > 0) {
          setExpandedTopic(visibleTopics[0].id);
        } else {
          setExpandedTopic(null);
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
    showComingSoon: t.showComingSoon ?? false,
    levels: t.levels.map((l: any) => ({
      ...l,
      status: levelStatusMap[l.id]?.status || 'LOCKED',
      stars: levelStatusMap[l.id]?.stars || 0,
      attempted: levelStatusMap[l.id]?.attempted || false,
      questionsCount: l.questionsCount || 10,
      timeLimit: l.timeLimit ?? null,
      passingPercentage: l.passingPercentage ?? 70,
    })),
  }));

  const activeTopicObj: TopicData | undefined =
    mappedTopics.find((t) => t.id === expandedTopic) || mappedTopics[0];
  const totalCompleted = mappedTopics.reduce(
    (acc: number, t: TopicData) => acc + t.levels.filter((l: LevelData) => l.status === 'COMPLETED').length,
    0,
  );
  const totalLevels = mappedTopics.reduce((acc: number, t: TopicData) => acc + t.levels.length, 0);
  const globalProgress = totalLevels > 0 ? (totalCompleted / totalLevels) * 100 : 0;
  const pendingTheme = pendingStart
    ? getColorOption(pendingStart.topic.colorScheme)
    : getColorOption('indigo');
  const PendingTopicIcon = pendingStart
    ? getIconOption(pendingStart.topic.iconKey).Icon
    : PlayCircle;
  const instructions =
    pendingStart?.level.simulationMode === 'EXAM'
      ? [
          'Leia cada questão com calma e confirme sua resposta quando estiver seguro.',
          'O feedback aparece ao final do simulado, junto com seu resultado completo.',
          pendingStart.level.timeLimit
            ? 'Fique de olho no cronômetro: quando o tempo acabar, a tentativa será finalizada.'
            : 'Este exame não tem cronômetro, então você pode concluir no seu ritmo.',
        ]
      : [
          'O modo treino mostra feedback imediato após cada resposta confirmada.',
          'Use este nível para aprender com mais leveza e reforçar os pontos principais.',
          'Ao concluir, seu desempenho atualiza XP, progresso e histórico normalmente.',
        ];

  const handleStartLevel = (level: LevelData, topic: TopicData) => {
    setPendingStart({ level, topic });
  };

  const handleConfirmStart = () => {
    if (!pendingStart) return;

    navigate(
      `/dashboard/simulations/engine/${pendingStart.level.id}?mode=${pendingStart.level.simulationMode}`,
    );
  };

  if (mappedTopics.length === 0 || !activeTopicObj) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 py-8 pb-32">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard/explore')}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Catálogo
            </button>
          </div>

          <EmptyState message="Este exame ainda não possui tópicos públicos disponíveis." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Modal
        isOpen={!!pendingStart}
        onClose={() => setPendingStart(null)}
        title="Preparar simulado"
        size="lg"
      >
        {pendingStart && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner shrink-0 bg-gradient-to-br',
                  getColorOption(pendingStart.topic.colorScheme).gradient,
                )}
              >
                <PendingTopicIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold border',
                      pendingStart.level.simulationMode === 'EXAM'
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100',
                    )}
                  >
                    {pendingStart.level.simulationMode === 'EXAM'
                      ? 'Modo exame'
                      : 'Modo treino'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {pendingStart.topic.name}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 font-display">
                  {pendingStart.level.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {pendingStart.level.description ||
                    'Revise este nível com atenção antes de avançar na trilha.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Tempo
                  </span>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {pendingStart.level.simulationMode === 'EXAM'
                    ? formatDuration(pendingStart.level.timeLimit)
                    : 'Sem cronômetro'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Target className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Questões
                  </span>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {pendingStart.level.questionsCount} questões
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Recompensa
                  </span>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {pendingStart.level.xpReward} XP
                </p>
              </div>
            </div>

            <div
              className={cn(
                'rounded-3xl border px-5 py-5',
                pendingTheme.bgLight,
                pendingTheme.borderLight,
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                {pendingStart.level.simulationMode === 'EXAM' ? (
                  <ShieldCheck className={cn('h-5 w-5', pendingTheme.textDark)} />
                ) : (
                  <Brain className={cn('h-5 w-5', pendingTheme.textDark)} />
                )}
                <h4 className={cn('font-bold', pendingTheme.textDark)}>
                  Instruções rápidas
                </h4>
              </div>
              <div className="space-y-2.5 text-sm text-slate-600">
                {instructions.map((instruction) => (
                  <p key={instruction} className="flex items-start gap-2">
                    <span className={cn('mt-0.5 text-base leading-none', pendingTheme.textDark)}>
                      •
                    </span>
                    <span>{instruction}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-sm text-amber-800">
                Meta de aprovação: <span className="font-bold">{pendingStart.level.passingPercentage ?? 70}%</span>
                {' '}de acertos para concluir este nível com sucesso.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => setPendingStart(null)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmStart}
                className={cn(
                  'flex-1 py-3.5 rounded-2xl font-bold text-white border-b-4 active:border-b-0 active:translate-y-1 transition-all',
                  pendingTheme.buttonBg,
                  pendingTheme.buttonBorder,
                )}
              >
                Começar agora
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 py-8 pb-32">
        {/* Back Button */}
        <div className="mb-6 lg:hidden">
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
              {/* Back Button (Desktop) */}
              <div>
                <button
                  onClick={() => navigate('/dashboard/explore')}
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Catálogo
                </button>
              </div>

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
                            {topic.levels.length === 0 && topic.showComingSoon
                              ? 'Em breve'
                              : `${completed}/${topic.levels.length} concluídos`}
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
                            {topic.levels.length === 0 && topic.showComingSoon
                              ? 'Em breve'
                              : `${completedCount}/${topic.levels.length} concluídos`}
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
                          isLast={
                            idx === topic.levels.length - 1 &&
                            !topic.showComingSoon
                          }
                        />
                      ))}
                      {topic.showComingSoon && <ComingSoonNodeTimeline />}
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
                    isLast={
                      idx === activeTopicObj.levels.length - 1 &&
                      !activeTopicObj.showComingSoon
                    }
                  />
                ))}
                {activeTopicObj.showComingSoon && <ComingSoonNodeTimeline />}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
