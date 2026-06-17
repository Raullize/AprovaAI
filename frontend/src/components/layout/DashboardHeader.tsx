import React from 'react';
import { Bell, User as UserIcon, Flame, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Início',
  '/dashboard/explore': 'Explorar Exames',
  '/dashboard/exams': 'Exames',
  '/dashboard/users': 'Usuários',
  '/dashboard/settings': 'Configurações',
  '/dashboard/profile': 'Perfil',
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
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);

  const initials = user?.fullName
    ? user.fullName
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : (user?.username?.[0]?.toUpperCase() ?? '?');

  const MOCK_STREAK = 7;
  const MOCK_DAILY_GOAL = 3;
  const MOCK_DAILY_DONE = 2;
  const dailyProgress = (MOCK_DAILY_DONE / MOCK_DAILY_GOAL) * 100;

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
            <div className="flex items-center gap-1.5 sm:gap-2 bg-orange-50 border border-orange-200 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5">
              <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 fill-orange-400" />
              <span className="text-xs sm:text-sm font-bold text-orange-600">{MOCK_STREAK}</span>
            </div>

            {/* Daily goal progress */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-none">META</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 leading-tight">
                  {MOCK_DAILY_DONE}/{MOCK_DAILY_GOAL}
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
              <span className="text-xs sm:text-sm font-bold text-amber-600">{user?.xp || 0} XP</span>
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
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-700 leading-tight">
              {user?.username || user?.fullName || 'Estudante'}
            </span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-indigo-500/20">
            {user?.fullName ? (
              initials
            ) : (
              <UserIcon className="h-4.5 w-4.5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
