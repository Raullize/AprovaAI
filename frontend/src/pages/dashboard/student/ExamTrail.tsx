import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Zap,
  PlayCircle,
  ArrowLeft,
  Clock3,
  Brain,
  ShieldCheck,
  Target,
  Star,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatTimeLimit } from '../../../lib/format';
import { getIconOption, getColorOption } from '../../../config/examThemes';
import { examsService } from '../../../services/exams.service';
import type { Exam } from '../../../services/exams.service';
import { topicsService } from '../../../services/topics.service';
import type { Topic } from '../../../services/topics.service';
import { simulationAttemptsService } from '../../../services/simulation-attempts.service';
import type { ApiSimulationHistoryItem } from '../../../services/simulation-attempts.service';
import { simulationsService } from '../../../services/simulations.service';
import type { Simulation } from '../../../services/simulations.service';
import Loading from '../../../components/ui/Loading';
import Modal from '../../../components/ui/Modal';
import EmptyState from '../../../components/ui/EmptyState';
import { useExamFavorites } from '../../../hooks/useExamFavorites';
import type {
  SimulationData,
  TopicData,
} from '../../../components/trail/SimulationNodeTimeline';
import { TopicTimeline } from '../../../components/trail/TopicTimeline';

type TrailTopic = Topic & { simulations: Simulation[] };

export default function ExamTrail() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useExamFavorites();

  const [exam, setExam] = useState<Exam | null>(null);
  const [topics, setTopics] = useState<TrailTopic[]>([]);
  const [history, setHistory] = useState<ApiSimulationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingStart, setPendingStart] = useState<{
    simulation: SimulationData;
    topic: TopicData;
  } | null>(null);

  useEffect(() => {
    async function loadTrail() {
      try {
        setIsLoading(true);
        const examData = await examsService.findOne(examId!);
        setExam(examData);

        const topicsDataAll = await topicsService.findAll(examData.id);
        const topicsData = topicsDataAll.filter(
          (topic) => topic.status === 'PUBLISHED',
        );

        const topicsWithSimulations = await Promise.all(
          topicsData.map(async (topic) => {
            const simulationsData = await simulationsService.findAll(topic.id);
            const publicSimulations = simulationsData
              .filter(
                (sim) =>
                  sim.status === 'PUBLISHED' && (sim.questionsCount ?? 0) > 0,
              )
              .sort((a, b) => a.order - b.order);

            return {
              ...topic,
              simulations: publicSimulations,
            };
          }),
        );

        const visibleTopics = topicsWithSimulations
          .filter(
            (topic) =>
              topic.simulations.length > 0 || topic.showComingSoon === true,
          )
          .sort((a, b) => a.order - b.order);

        setTopics(visibleTopics);

        const historyData = await simulationAttemptsService.getHistory();
        setHistory(historyData);
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

  if (isLoading) {
    return <Loading />;
  }

  const allSimulations = topics.flatMap((t) => t.simulations);
  const simulationStatusMap: Record<
    string,
    {
      stars: number;
      passed: boolean;
      attempted: boolean;
      status: 'COMPLETED' | 'CURRENT' | 'LOCKED';
    }
  > = {};

  let previousPassed = true;

  allSimulations.forEach((sim) => {
    const simHistory = history.filter(
      (h) => h.simulationId === sim.id && h.status === 'COMPLETED',
    );
    const passed = simHistory.some((h) => h.passed);
    const attempted = simHistory.length > 0;
    const maxStars = simHistory.reduce((max, h) => {
      const s = h.stars ?? 0;
      return s > max ? s : max;
    }, 0);

    let status: 'COMPLETED' | 'CURRENT' | 'LOCKED' = 'LOCKED';
    if (passed) {
      status = 'COMPLETED';
    } else if (previousPassed) {
      status = 'CURRENT';
    }

    simulationStatusMap[sim.id] = {
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
    iconKey: t.iconKey ?? '',
    colorScheme: t.colorScheme ?? '',
    simulations: t.simulations.map((sim) => ({
      ...sim,
      status: simulationStatusMap[sim.id]?.status || 'LOCKED',
      stars: simulationStatusMap[sim.id]?.stars || 0,
      attempted: simulationStatusMap[sim.id]?.attempted || false,
      questionsCount: sim.questionsCount || 10,
      timeLimit: sim.timeLimit ?? null,
      passingPercentage: sim.passingPercentage ?? 70,
    })),
  }));

  const totalCompleted = mappedTopics.reduce(
    (acc: number, t: TopicData) =>
      acc +
      t.simulations.filter((sim: SimulationData) => sim.status === 'COMPLETED')
        .length,
    0,
  );
  const totalSimulations = mappedTopics.reduce(
    (acc: number, t: TopicData) => acc + t.simulations.length,
    0,
  );
  const globalProgress =
    totalSimulations > 0 ? (totalCompleted / totalSimulations) * 100 : 0;
  const fav = examId ? isFavorite(examId) : false;
  const pendingTheme = pendingStart
    ? getColorOption(pendingStart.topic.colorScheme)
    : getColorOption('indigo');
  const PendingTopicIcon = pendingStart
    ? getIconOption(pendingStart.topic.iconKey).Icon
    : PlayCircle;
  const instructions =
    pendingStart?.simulation.simulationMode === 'EXAM'
      ? [
          'Leia cada questão com calma e confirme sua resposta quando estiver seguro.',
          'O feedback aparece ao final do simulado, junto com seu resultado completo.',
          pendingStart.simulation.timeLimit
            ? 'Fique de olho no cronômetro: quando o tempo acabar, a tentativa será finalizada.'
            : 'Este exame não tem cronômetro, então você pode concluir no seu ritmo.',
        ]
      : [
          'O modo treino mostra feedback imediato após cada resposta confirmada.',
          'Use este simulado para aprender com mais leveza e reforçar os pontos principais.',
          pendingStart?.simulation.timeLimit
            ? 'Fique de olho no cronômetro: quando o tempo acabar, a tentativa será finalizada.'
            : 'Este treino não tem cronômetro, então você pode concluir no seu ritmo.',
        ];

  const handleStartSimulation = (
    simulation: SimulationData,
    topic: TopicData,
  ) => {
    setPendingStart({ simulation, topic });
  };

  const handleConfirmStart = () => {
    if (!pendingStart) return;

    navigate(
      `/dashboard/simulations/engine/${pendingStart.simulation.id}?mode=${pendingStart.simulation.simulationMode}&examId=${examId}`,
    );
  };

  const scrollToTopic = (id: string) => {
    document
      .getElementById(`topic-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (mappedTopics.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard/explore')}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Catálogo
            </button>
          </div>

          <EmptyState message="Este exame ainda não possui tópicos publicados disponíveis." />
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
                      pendingStart.simulation.simulationMode === 'EXAM'
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100',
                    )}
                  >
                    {pendingStart.simulation.simulationMode === 'EXAM'
                      ? 'Modo exame'
                      : 'Modo treino'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {pendingStart.topic.name}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 font-display">
                  {pendingStart.simulation.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {pendingStart.simulation.description ||
                    'Revise este simulado com atenção antes de avançar na trilha.'}
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
                  {pendingStart.simulation.timeLimit &&
                  pendingStart.simulation.timeLimit > 0
                    ? formatTimeLimit(pendingStart.simulation.timeLimit)
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
                  {pendingStart.simulation.questionsCount} questões
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
                  {pendingStart.simulation.xpReward} XP
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
                {pendingStart.simulation.simulationMode === 'EXAM' ? (
                  <ShieldCheck
                    className={cn('h-5 w-5', pendingTheme.textDark)}
                  />
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
                    <span
                      className={cn(
                        'mt-0.5 text-base leading-none',
                        pendingTheme.textDark,
                      )}
                    >
                      •
                    </span>
                    <span>{instruction}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-sm text-amber-800">
                Meta de aprovação:{' '}
                <span className="font-bold">
                  {pendingStart.simulation.passingPercentage ?? 70}%
                </span>{' '}
                de acertos para concluir este simulado com sucesso.
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

      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
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

        {/* Exam Overview */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={cn(
                'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner',
                getColorOption(exam?.colorScheme || 'orange').gradient,
              )}
            >
              <PlayCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 font-display truncate">
                {exam?.name || 'Trilha'}
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                {exam?.category === 'OAB'
                  ? 'Exame da Ordem'
                  : 'Trilha de Certificação'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-none">
                Progresso
              </span>
              <span className="text-xl font-bold text-indigo-600 block mt-1 font-display">
                {totalCompleted}/{totalSimulations}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleFavorite(examId!)}
              aria-label={fav ? 'Remover dos fixados' : 'Fixar exame'}
              className="p-2 rounded-xl text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors shrink-0"
            >
              <Star
                className={cn(
                  'h-5 w-5',
                  fav && 'fill-amber-400 text-amber-400',
                )}
              />
            </button>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Progresso Global
              </span>
              <span className="text-sm font-bold text-indigo-600">
                {Math.round(globalProgress)}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick links to topics */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {mappedTopics.map((topic) => {
            const completed = topic.simulations.filter(
              (l) => l.status === 'COMPLETED',
            ).length;
            const colorOpt = getColorOption(topic.colorScheme);
            const iconOpt = getIconOption(topic.iconKey);
            const TopicIcon = iconOpt.Icon;
            return (
              <button
                key={topic.id}
                onClick={() => scrollToTopic(topic.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap shrink-0 bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/40 shadow-sm transition-all"
              >
                <span
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br',
                    colorOpt.gradient,
                  )}
                >
                  <TopicIcon className="h-3.5 w-3.5 text-white" />
                </span>
                <span>{topic.name}</span>
                <span className="text-slate-400 font-semibold">
                  {completed}/{topic.simulations.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Full vertical trail */}
        <div className="mt-8 space-y-12">
          {mappedTopics.map((topic) => {
            const completedCount = topic.simulations.filter(
              (l) => l.status === 'COMPLETED',
            ).length;
            const iconOpt = getIconOption(topic.iconKey);
            const colorOpt = getColorOption(topic.colorScheme);
            const TopicIcon = iconOpt.Icon;

            return (
              <section
                key={topic.id}
                id={`topic-${topic.id}`}
                className="scroll-mt-24 space-y-6"
              >
                {/* Topic header */}
                <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shadow-inner',
                        colorOpt.gradient,
                      )}
                    >
                      <TopicIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                        {topic.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        {topic.simulations.length === 0 && topic.showComingSoon
                          ? 'Em breve'
                          : `${completedCount}/${topic.simulations.length} concluídos`}
                      </p>
                    </div>
                  </div>
                  <div className="w-24 sm:w-32 shrink-0">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full bg-gradient-to-r',
                          colorOpt.gradient,
                        )}
                        style={{
                          width: `${
                            topic.simulations.length
                              ? (completedCount / topic.simulations.length) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <TopicTimeline topic={topic} onStart={handleStartSimulation} />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
