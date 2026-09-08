import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Zap,
  Shield,
  Settings as SettingsIcon,
  Award,
  Flame,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Lock,
  History,
} from 'lucide-react';

import { cn } from '../../../lib/utils';
import UserAvatar from '../../../components/ui/UserAvatar';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { IconBox } from '../../../components/ui/IconBox';
import { studentService } from '../../../services/student.service';
import {
  simulationAttemptsService,
  type ApiSimulationHistoryItem,
} from '../../../services/simulation-attempts.service';
import { achievements } from '../../../mocks/achievements.mock';

export default function Profile() {
  const { user } = useAuth();
  const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : 'Estudante';
  const [activeTab, setActiveTab] = useState<
    'overview' | 'streak' | 'achievements'
  >('overview');

  const todayRef = new Date();
  const [selectedYear, setSelectedYear] = useState(todayRef.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(todayRef.getMonth());

  const isCurrentMonth =
    selectedYear === todayRef.getFullYear() &&
    selectedMonth === todayRef.getMonth();

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return; // não navega além do mês atual
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Gera estrutura do calendário para o mês selecionado
  const getMonthCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: ({ dateNum: number } | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ dateNum: i });
    }

    const date = new Date(year, month, 1);
    const monthName = date.toLocaleString('pt-BR', { month: 'long' });
    const capitalizedMonth =
      monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return { days, monthName: capitalizedMonth };
  };

  const { days: monthDays, monthName: currentMonthName } = getMonthCalendar(
    selectedYear,
    selectedMonth,
  );
  const currentDay = isCurrentMonth ? todayRef.getDate() : -1; // -1 = sem "dia atual" em meses passados

  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState(user?.streakCount || 0);
  const [history, setHistory] = useState<ApiSimulationHistoryItem[]>([]);

  // Busca stats do mês selecionado sempre que o mês/ano mudar
  useEffect(() => {
    async function loadMonthStats() {
      const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      try {
        const stats = await studentService.getDashboardStats(monthParam);
        setActiveDays(stats.activeDays);
        if (isCurrentMonth) {
          setStreakCount(stats.streakCount);
        }
      } catch (err) {
        console.error('Failed to load month stats:', err);
      }
    }
    loadMonthStats();
  }, [selectedYear, selectedMonth, isCurrentMonth]);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const historyData = await simulationAttemptsService.getHistory();
        setHistory(historyData);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    }
    loadProfileData();
  }, []);

  const totalXP = user?.xp || 0;
  const currentLevel = Math.floor(totalXP / 100);
  const xpNeededForNextLevel = 100 - (totalXP % 100 || 0);

  const completedAttempts = history.filter((h) => h.status === 'COMPLETED');
  const totalCorrect = completedAttempts.reduce(
    (sum, h) => sum + (h.score || 0),
    0,
  );
  const totalQuest = completedAttempts.reduce(
    (sum, h) => sum + (h.totalQuestions || 0),
    0,
  );
  const accuracy =
    totalQuest > 0 ? Math.round((totalCorrect / totalQuest) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">
          Meu Perfil
        </h1>
        <p className="text-slate-500 mt-1">
          Gerencie sua conta e acompanhe seus principais indicadores na
          plataforma.
        </p>
      </div>

      {/* User Profile Card */}
      <Card
        padding="large"
        className="flex flex-col sm:flex-row items-center gap-6 relative"
      >
        <Link
          to="/dashboard/profile/settings"
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-655 hover:bg-slate-55 active:scale-95 transition-all border border-slate-100"
          title="Configurações"
        >
          <SettingsIcon className="h-5 w-5" />
        </Link>

        <UserAvatar size="xl" />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            {user?.fullName || 'Usuário'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            @{user?.username || 'username'}
          </p>
          {user?.createdAt && (
            <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5 justify-center sm:justify-start font-medium">
              <Calendar className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              Por aqui desde{' '}
              {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
            <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-150">
              {roleLabel}
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold border border-amber-150 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 fill-current animate-pulse" />
              Simulado {currentLevel}
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200/80 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'pb-4 text-sm font-bold transition-all relative flex items-center gap-2',
            activeTab === 'overview'
              ? 'text-indigo-650'
              : 'text-slate-400 hover:text-slate-650',
          )}
        >
          <Zap
            className={cn(
              'h-4 w-4',
              activeTab === 'overview' && 'fill-current animate-pulse',
            )}
          />
          Visão Geral
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('streak')}
          className={cn(
            'pb-4 text-sm font-bold transition-all relative flex items-center gap-2',
            activeTab === 'streak'
              ? 'text-indigo-650'
              : 'text-slate-400 hover:text-slate-650',
          )}
        >
          <Flame
            className={cn(
              'h-4 w-4',
              activeTab === 'streak' && 'fill-current animate-pulse',
            )}
          />
          Ofensiva
          {activeTab === 'streak' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={cn(
            'pb-4 text-sm font-bold transition-all relative flex items-center gap-2',
            activeTab === 'achievements'
              ? 'text-indigo-650'
              : 'text-slate-400 hover:text-slate-650',
          )}
        >
          <Award className="h-4 w-4" />
          Conquistas
          {activeTab === 'achievements' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <p className="font-bold text-slate-700 text-sm">
                    {totalXP} XP
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar
                  progress={totalXP % 100}
                  colorScheme="indigo"
                  size="md"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Faltam {xpNeededForNextLevel} XP para o Simulado{' '}
                  {currentLevel + 1}
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
                <ProgressBar
                  progress={accuracy}
                  colorScheme="emerald"
                  size="md"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Mapeado de todos os seus simulados
                </p>
              </div>
            </Card>

            {/* Subscription Card */}
            <Card className="flex flex-col justify-between" padding="normal">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Plano Atual
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-2 flex items-center gap-1.5 font-display uppercase">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  {user?.subscriptionPlan || 'FREE'}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {user?.subscriptionPlan === 'PREMIUM'
                  ? 'Plano Premium'
                  : 'Plano Gratuito'}
              </p>
            </Card>
          </div>

          {/* Achievements Snippet Card */}
          <Card padding="large">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-base font-display">
                  Mural de Conquistas (Recentes)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('achievements')}
                className="text-xs font-bold text-indigo-650 hover:text-indigo-750 hover:underline"
              >
                Ver todas &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {achievements.slice(0, 3).map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'p-5 rounded-3xl border flex items-center gap-4 transition-all relative',
                      item.isUnlocked
                        ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer'
                        : 'bg-slate-50/50 border-slate-100 opacity-60',
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm',
                        item.color,
                      )}
                    >
                      <IconComp className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                    {!item.isUnlocked && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-lg">
                        Bloqueado
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent History Card */}
          <Card padding="large">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-base font-display">
                  Histórico Recente de Simulados
                </h3>
              </div>
              <Link
                to="/dashboard/simulations"
                className="text-xs font-bold text-indigo-650 hover:text-indigo-755 hover:underline"
              >
                Ver todos &rarr;
              </Link>
            </div>
            {history.length === 0 ? (
              <p className="text-slate-400 text-sm py-4">
                Você ainda não realizou nenhum simulado.
              </p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-700 text-sm">
                        {item.simulation?.name || 'Simulado'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')} •{' '}
                        {Math.round((item.timeSpent || 0) / 60)} min
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-xl text-xs font-bold border',
                          item.passed
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-650 border-rose-100',
                        )}
                      >
                        {item.score}/{item.totalQuestions} acertos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Monthly Streak Calendar Tab */}
      {activeTab === 'streak' && (
        <div className="space-y-6 animate-fadeIn">
          <Card padding="large">
            {/* Header com navegação de meses */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <IconBox
                  icon={
                    <Flame className="h-6 w-6 text-white fill-current animate-pulse" />
                  }
                  size="lg"
                  shape="square"
                  className="bg-orange-500 shadow-md shadow-orange-500/20"
                />
                <div>
                  <h3 className="font-bold text-slate-800 text-base font-display">
                    Ofensiva Mensal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Você estudou{' '}
                    {isCurrentMonth
                      ? activeDays.filter((d) => d <= currentDay).length
                      : activeDays.length}{' '}
                    dias em {currentMonthName}
                  </p>
                </div>
              </div>

              {/* Controles de navegação + badge de streak */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  title="Mês anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs font-bold text-slate-600 min-w-[90px] text-center">
                  {currentMonthName} {selectedYear}
                </span>

                <button
                  onClick={goToNextMonth}
                  disabled={isCurrentMonth}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Próximo mês"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-150 rounded-xl px-3 py-1.5 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  {streakCount} {streakCount === 1 ? 'dia' : 'dias'}
                </span>
              </div>
            </div>

            {/* Calendar days of the week header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
                <div
                  key={idx}
                  className="py-1 text-[10px] uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid slots */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, idx) => {
                if (!day) return <div key={idx} className="aspect-square" />;
                const isActive = activeDays.includes(day.dateNum);
                const isCurrentDay =
                  day.dateNum === currentDay && isCurrentMonth;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative border',
                      isActive
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/20'
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100/50',
                      isCurrentDay &&
                        !isActive &&
                        'ring-2 ring-indigo-500 ring-offset-2',
                    )}
                    title={`${day.dateNum} de ${currentMonthName} de ${selectedYear}`}
                  >
                    {day.dateNum}
                    {isCurrentDay && isActive && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Mural de Conquistas Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Introduction Banner Card */}
          <Card
            padding="large"
            className="bg-gradient-to-r from-indigo-600 via-indigo-750 to-violet-700 text-white shadow-xl shadow-indigo-500/10 border-0 overflow-hidden relative"
          >
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 translate-y-24 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold font-display leading-tight">
                  Minhas Conquistas
                </h1>
                <p className="text-indigo-50 text-sm mt-2 max-w-xl leading-relaxed">
                  Desbloqueie conquistas respondendo questões, completando
                  simulados e mantendo sua ofensiva de estudos ativa!
                </p>
              </div>

              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg self-center md:self-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="text-white/15"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="text-white"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    strokeDasharray={201}
                    strokeDashoffset={
                      201 *
                      (1 -
                        achievements.filter((a) => a.isUnlocked).length /
                          achievements.length)
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black font-display text-white leading-none">
                    {achievements.filter((a) => a.isUnlocked).length}/
                    {achievements.length}
                  </span>
                  <span className="text-[7.5px] uppercase font-black text-indigo-150 tracking-wider mt-1">
                    Conquistas
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((item) => {
              const IconComp = item.icon;
              return (
                <Card
                  key={item.id}
                  padding="large"
                  className={cn(
                    'transition-all relative border flex flex-col justify-between h-44',
                    item.isUnlocked
                      ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer duration-300 shadow-sm'
                      : 'bg-slate-50/40 border-slate-200/60 border-dashed opacity-75',
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300',
                          item.isUnlocked
                            ? 'scale-100 hover:scale-110'
                            : 'scale-95',
                          item.color,
                        )}
                      >
                        <IconComp className="h-5.5 w-5.5" />
                      </div>

                      {item.isUnlocked ? (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          Desbloqueada
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          Bloqueada
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <h4
                        className={cn(
                          'font-bold text-sm leading-tight font-display',
                          item.isUnlocked ? 'text-slate-800' : 'text-slate-500',
                        )}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
