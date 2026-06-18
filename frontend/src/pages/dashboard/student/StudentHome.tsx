import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  Compass,
  Flame,
  Award,
  Zap,
  History,
  Trophy,
  Lock,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getIconOption, getColorOption } from '../../../config/examThemes';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { IconBox } from '../../../components/ui/IconBox';
import api from '../../../services/api';

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState(user?.streakCount || 0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/student/dashboard-stats'),
          api.get('/simulations/history'),
        ]);

        if (statsRes.data) {
          setActiveDays(statsRes.data.activeDays);
          setStreakCount(statsRes.data.streakCount);
        }

        if (historyRes.data) {
          setHistory(historyRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }

    loadData();
  }, []);

  const totalXP = user?.xp || 0;
  const currentLevel = Math.floor(totalXP / 100);
  const xpNeededForNextLevel = 100 - (totalXP % 100 || 0);

  const completedAttempts = history.filter((h) => h.status === 'COMPLETED');
  const totalCorrect = completedAttempts.reduce((sum, h) => sum + (h.score || 0), 0);
  const totalQuest = completedAttempts.reduce((sum, h) => sum + (h.totalQuestions || 0), 0);
  const accuracy = totalQuest > 0 ? Math.round((totalCorrect / totalQuest) * 100) : 0;

  // Extract unique recent exams from history
  const recentExams = Array.from(
    new Map(
      history
        .filter(
          (h) =>
            h.level?.topic?.exam?.name &&
            (h.level?.topic?.exam?.slug || h.level?.topic?.exam?.id),
        )
        .map((h) => {
          const examKey =
            h.level?.topic?.exam?.id ??
            h.level?.topic?.exam?.slug ??
            h.level?.topic?.exam?.name ??
            'unknown-exam';
          const examHistory = history.filter(
            (item) =>
              (item.level?.topic?.exam?.id ??
                item.level?.topic?.exam?.slug ??
                item.level?.topic?.exam?.name) === examKey &&
              item.status === 'COMPLETED',
          );
          const completedLevels = new Set(examHistory.map((item) => item.levelId));
          const totalEstimated = 10;
          const progress = Math.min(100, Math.round((completedLevels.size / totalEstimated) * 100));
          return [
            examKey,
            {
              id: examKey,
              routeId:
                h.level.topic.exam.slug ||
                h.level.topic.exam.id ||
                examKey,
              title: h.level.topic.exam.name,
              iconKey: h.level.topic.exam.iconKey || 'cpu',
              colorScheme: h.level.topic.exam.colorScheme || 'orange',
              lastTopic: h.level.name,
              progress,
            },
          ];
        })
    ).values()
  ).slice(0, 2);

  const getWeeklyActiveState = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDayOfWeek);

    return Array.from({ length: 7 }).map((_, i) => {
      const dayDate = new Date(sunday);
      dayDate.setDate(sunday.getDate() + i);
      const isCurrentMonth =
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();
      return isCurrentMonth && activeDays.includes(dayDate.getDate());
    });
  };

  const weeklyActive = getWeeklyActiveState();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome text */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            Olá,{' '}
            {user?.fullName?.split(' ')[0] || user?.username || 'Estudante'}!
          </h1>
          <p className="text-slate-500 mt-1">
            Pronto para bater sua meta diária de estudos?
          </p>
        </div>

        {/* Metas e Gamificação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Streak Card */}
          <Card
            className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100/70 flex flex-col justify-between"
            padding="normal"
          >
            <div className="flex items-center gap-4">
              <IconBox
                icon={
                  <Flame className="h-6 w-6 text-white fill-current animate-pulse" />
                }
                size="lg"
                shape="square"
                className="bg-orange-500 shadow-md shadow-orange-500/20"
                iconClassName=""
              />
              <div>
                <p className="text-xs text-orange-700/80 font-bold uppercase tracking-wider">
                  Ofensiva
                </p>
                <p className="text-2xl font-black text-orange-950 font-display">
                  {streakCount} {streakCount === 1 ? 'dia' : 'dias'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-1">
              {weeklyActive.map((active, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-7 h-7 sm:w-8 sm:h-8 rounded-lg',
                      active
                        ? 'bg-orange-500 shadow-sm shadow-orange-500/20'
                        : 'bg-orange-200/50',
                    )}
                  />
                  <span className="text-[10px] font-bold text-orange-800/40">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* XP Total Card */}
          <Card className="flex flex-col justify-between" padding="normal">
            <div className="flex items-center gap-3">
              <IconBox
                icon={<Zap className="h-5 w-5 animate-pulse" />}
                colorScheme="indigo"
                size="md"
                shape="square"
              />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  XP Total
                </p>
                <p className="font-bold text-slate-700 text-sm">{totalXP} XP</p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar
                progress={totalXP % 100}
                colorScheme="indigo"
                size="md"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Faltam {xpNeededForNextLevel} XP para o Nível {currentLevel + 1}
              </p>
            </div>
          </Card>

          {/* Accuracy Card */}
          <Card className="flex flex-col justify-between" padding="normal">
            <div className="flex items-center gap-3">
              <IconBox
                icon={<Award className="h-5 w-5" />}
                colorScheme="emerald"
                size="md"
                shape="square"
              />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Aproveitamento
                </p>
                <p className="font-bold text-slate-700 text-sm">
                  {accuracy}% de acertos
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar progress={accuracy} colorScheme="emerald" size="md" />
              <p className="text-[10px] text-slate-400 mt-1">
                Mapeado de todos os seus simulados
              </p>
            </div>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-500" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Quick Simulation */}
          <Card padding="normal" className="flex items-start gap-4 text-left">
            <IconBox
              icon={<Zap className="h-6 w-6 fill-current" />}
              colorScheme="indigo"
              size="lg"
              shape="square"
            />
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Simulado Expresso
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Gere um teste rápido de 10 questões aleatórias baseadas nos
                tópicos da sua trilha.
              </p>
            </div>
          </Card>

          {/* Spaced Repetition/Incorrect questions review */}
          <button
            onClick={() => navigate('/dashboard/simulations')}
            className="group w-full"
          >
            <Card
              hoverEffect
              padding="normal"
              className="flex items-start gap-4 text-left border-slate-200 group-hover:border-rose-300 group-hover:shadow-rose-500/5 transition-all"
            >
              <IconBox
                icon={<History className="h-6 w-6" />}
                colorScheme="rose"
                size="lg"
                shape="square"
                className="group-hover:scale-110 transition-transform"
              />
              <div>
                <h3 className="font-bold text-slate-800 text-base group-hover:text-rose-650 transition-colors">
                  Histórico de Simulados
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Acesse o histórico completo de tentativas e confira seu
                  progresso nos simulados realizados.
                </p>
              </div>
            </Card>
          </button>
        </div>

        {/* Continue Learning */}
        {recentExams.length > 0 ? (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-indigo-500" />
              Continue de onde parou
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {recentExams.map((exam) => {
                const iconOpt = getIconOption(exam.iconKey);
                const colorOpt = getColorOption(exam.colorScheme);
                const Icon = iconOpt.Icon;
                return (
                  <button
                    key={exam.id}
                    onClick={() => navigate(`/dashboard/explore/${exam.routeId}`)}
                    className="group w-full"
                  >
                    <Card
                      hoverEffect
                      padding="normal"
                      className="text-left group-hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner bg-gradient-to-br',
                            colorOpt.gradient,
                          )}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 truncate text-lg group-hover:text-indigo-600 transition-colors">
                            {exam.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5 truncate">
                            Próximo:{' '}
                            <span className="font-medium text-slate-700">
                              {exam.lastTopic}
                            </span>
                          </p>

                          <div className="mt-4 flex items-center gap-3">
                            <ProgressBar
                              progress={exam.progress}
                              size="md"
                              barClassName={colorOpt.gradient}
                              className="flex-1"
                            />
                            <span className="text-xs font-bold text-slate-400 w-8">
                              {exam.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty state */
          <Card padding="large" className="mb-8 text-center">
            <IconBox
              icon={<PlayCircle className="h-8 w-8 text-indigo-400" />}
              colorScheme="indigo"
              size="xl"
              shape="square"
              className="mx-auto mb-4"
            />
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Você ainda não iniciou nenhum exame
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Explore o catálogo e encontre a certificação ou concurso perfeito
              para você.
            </p>
            <button
              onClick={() => navigate('/dashboard/explore')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Compass className="h-5 w-5" />
              Explorar Catálogo
            </button>
          </Card>
        )}

        {/* Conquistas Recentes */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500" />
            Suas Conquistas
          </h2>
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="group text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 no-underline"
          >
            <span className="group-hover:underline underline-offset-4">
              Ver todas
            </span>
            <span>&rarr;</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Card padding="small" className="flex items-center gap-3">
            <IconBox
              icon={<Trophy className="h-5 w-5 text-white" />}
              size="md"
              shape="circle"
              className="bg-amber-500"
            />
            <div>
              <p className="font-bold text-slate-800 text-xs">
                Primeiros Passos
              </p>
              <p className="text-[10px] text-slate-400">
                Iniciou a primeira trilha
              </p>
            </div>
          </Card>
          <Card padding="small" className="flex items-center gap-3">
            <IconBox
              icon={<Zap className="h-5 w-5 text-white" />}
              size="md"
              shape="circle"
              className="bg-indigo-500"
            />
            <div>
              <p className="font-bold text-slate-800 text-xs">Foco Total</p>
              <p className="text-[10px] text-slate-400">
                Estudou 3 dias seguidos
              </p>
            </div>
          </Card>
          <Card
            padding="small"
            className="flex items-center gap-3 opacity-50 relative group"
          >
            <IconBox
              icon={<Lock className="h-5 w-5 text-white" />}
              size="md"
              shape="circle"
              className="bg-slate-300"
            />
            <div>
              <p className="font-bold text-slate-800 text-xs">
                Mestre de Nuvem
              </p>
              <p className="text-[10px] text-slate-400">Resolva 100 questões</p>
            </div>
          </Card>
        </div>

        {/* Explore CTA */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 flex flex-col sm:flex-row items-center gap-6 justify-between shadow-sm">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-indigo-900 mb-1">
              Quer começar algo novo?
            </h3>
            <p className="text-indigo-700/80 text-sm">
              Explore nosso catálogo com dezenas de exames e certificações.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/explore')}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
          >
            <Compass className="h-5 w-5" />
            Explorar Catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
