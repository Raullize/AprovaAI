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
} from 'lucide-react';

import { cn } from '../../../lib/utils';
import UserAvatar from '../../../components/ui/UserAvatar';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { IconBox } from '../../../components/ui/IconBox';
import api from '../../../services/api';
import { achievements } from './achievementsData';

export default function Profile() {
  const { user } = useAuth();
  const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : 'Estudante';

  // --- Navegação de meses ---
  const todayRef = new Date();
  const [selectedYear, setSelectedYear] = useState(todayRef.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(todayRef.getMonth()); // 0-indexed

  const isCurrentMonth =
    selectedYear === todayRef.getFullYear() && selectedMonth === todayRef.getMonth();

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
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return { days, monthName: capitalizedMonth };
  };

  const { days: monthDays, monthName: currentMonthName } = getMonthCalendar(
    selectedYear,
    selectedMonth,
  );
  const currentDay = isCurrentMonth ? todayRef.getDate() : -1; // -1 = sem "dia atual" em meses passados

  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState(user?.streakCount || 0);
  const [history, setHistory] = useState<any[]>([]);

  // Busca stats do mês selecionado sempre que o mês/ano mudar
  useEffect(() => {
    async function loadMonthStats() {
      const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      try {
        const statsRes = await api.get(`/student/dashboard-stats?month=${monthParam}`);
        if (statsRes.data) {
          setActiveDays(statsRes.data.activeDays);
          if (isCurrentMonth) {
            setStreakCount(statsRes.data.streakCount);
          }
        }
      } catch (err) {
        console.error('Failed to load month stats:', err);
      }
    }
    loadMonthStats();
  }, [selectedYear, selectedMonth]);

  // Carrega histórico apenas uma vez na montagem
  useEffect(() => {
    async function loadProfileData() {
      try {
        const historyRes = await api.get('/simulations/history');
        if (historyRes.data) {
          setHistory(historyRes.data);
        }
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
  const totalCorrect = completedAttempts.reduce((sum, h) => sum + (h.score || 0), 0);
  const totalQuest = completedAttempts.reduce((sum, h) => sum + (h.totalQuestions || 0), 0);
  const accuracy = totalQuest > 0 ? Math.round((totalCorrect / totalQuest) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            Meu Perfil
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie sua conta e acompanhe seus principais indicadores na plataforma.
          </p>
        </div>

        {/* User Profile Card */}
        <Card
          padding="large"
          className="flex flex-col sm:flex-row items-center gap-6 relative"
        >
          <Link
            to="/dashboard/profile/settings"
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95 transition-all border border-slate-100"
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
                Por aqui desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-150">
                {roleLabel}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold border border-amber-150 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 fill-current animate-pulse" />
                Nível {currentLevel}
              </span>
            </div>
          </div>
        </Card>

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
                Faltam {xpNeededForNextLevel} XP para o Nível{' '}
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
              <ProgressBar progress={accuracy} colorScheme="emerald" size="md" />
              <p className="text-[10px] text-slate-400 mt-1">
                Mapeado de todos os seus simulados
              </p>
            </div>
          </Card>

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
              {user?.subscriptionPlan === 'PREMIUM' ? 'Plano Premium' : 'Plano Gratuito'}
            </p>
          </Card>
        </div>

        {/* Monthly Streak Calendar */}
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
                iconClassName=""
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
              const isCurrentDay = day.dateNum === currentDay && isCurrentMonth;
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

        {/* Mural de Conquistas */}
        <Card padding="large">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800 text-base font-display">
                Mural de Conquistas
              </h3>
            </div>
            <Link
              to="/dashboard/profile/achievements"
              className="group text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 no-underline"
            >
              <span className="group-hover:underline underline-offset-4">
                Ver todas
              </span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}
