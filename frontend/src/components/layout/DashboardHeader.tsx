import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  User as UserIcon,
  Flame,
  Zap,
  Settings,
  LogOut,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../ui/UserAvatar';
import api from '../../services/api';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Início',
  '/dashboard/explore': 'Explorar Exames',
  '/dashboard/exams': 'Exames',
  '/dashboard/users': 'Usuários',
  '/dashboard/settings': 'Configurações',
  '/dashboard/profile': 'Perfil',
  '/dashboard/profile/settings': 'Editar Perfil',
  '/dashboard/profile/achievements': 'Minhas Conquistas',
  '/dashboard/leaderboard': 'Ranking Global',
};

function getPageTitle(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.includes('/topics')) return 'Tópicos';
  if (pathname.includes('/levels')) return 'Níveis';
  if (pathname.includes('/questions')) return 'Questões';
  return 'Dashboard';
}

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitle = getPageTitle(location.pathname);

  const [streakCount, setStreakCount] = useState(user?.streakCount || 0);
  const [dailyDone, setDailyDone] = useState(0);
  const dailyGoal = 3;

  useEffect(() => {
    if (!user || user.role === 'ADMIN') return;
    async function loadHeaderStats() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/student/dashboard-stats'),
          api.get('/simulations/history'),
        ]);

        if (statsRes.data) {
          setStreakCount(statsRes.data.streakCount);
        }

        if (historyRes.data) {
          const todayStr = new Date().toDateString();
          const doneToday = historyRes.data.filter((h: any) => {
            if (h.status !== 'COMPLETED') return false;
            const itemDate = new Date(h.createdAt).toDateString();
            return itemDate === todayStr;
          }).length;
          setDailyDone(doneToday);
        }
      } catch (err) {
        console.error('Failed to load header stats:', err);
      }
    }
    loadHeaderStats();
  }, [user]);

  const dailyProgress = Math.min(100, (dailyDone / dailyGoal) * 100);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      {/* Left — Page title (desktop) / Logo (mobile) */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-slate-800 hidden md:block">
          {pageTitle}
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {user?.role !== 'ADMIN' ? (
          <>
            {/* Streak */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 bg-orange-50 border border-orange-200 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 cursor-help"
              title={`Ofensiva atual: ${streakCount} ${streakCount === 1 ? 'dia' : 'dias'}. Recorde histórico: ${user?.bestStreak || 0} ${user?.bestStreak === 1 ? 'dia' : 'dias'}.`}
            >
              <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 fill-orange-400" />
              <span className="text-xs sm:text-sm font-bold text-orange-600">
                {streakCount}
              </span>
            </div>

            {/* Daily goal progress */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-none">
                  META
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 leading-tight">
                  {dailyDone}/{dailyGoal}
                </span>
              </div>
              <div className="w-12 sm:w-20 lg:w-28 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${dailyProgress}%` }}
                />
              </div>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 fill-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-amber-600">
                {user?.xp || 0} XP
              </span>
            </div>
          </>
        ) : null}

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl focus:outline-none transition-colors">
          <span className="sr-only">Notificações</span>
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User avatar */}
        <div className="relative flex items-center gap-2.5" ref={dropdownRef}>
          <div className="hidden md:flex flex-col items-end text-right text-slate-700">
            <span className="text-sm font-semibold leading-tight">
              {user?.fullName || user?.username || 'Estudante'}
            </span>
            <span className="text-xs text-slate-400 leading-tight">
              @{user?.username}
            </span>
          </div>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="focus:outline-none hover:opacity-80 transition-opacity shrink-0"
            title="Menu do Usuário"
          >
            <UserAvatar size="sm" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-100">
              {user?.role !== 'ADMIN' && (
                <button
                  onClick={() => {
                    navigate('/dashboard/profile');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2 text-left"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>Perfil</span>
                </button>
              )}
              <button
                onClick={() => {
                  navigate(
                    user?.role === 'ADMIN'
                      ? '/dashboard/settings'
                      : '/dashboard/profile/settings'
                  );
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2 text-left"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Configurações</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  signOut();
                  navigate('/login');
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors gap-2 text-left"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
