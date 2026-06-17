import React from 'react';
import { Bell, User as UserIcon, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Início',
  '/dashboard/exams': 'Exames',
  '/dashboard/users': 'Usuários',
  '/dashboard/settings': 'Configurações',
  '/dashboard/simulations': 'Simulados',
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
        {/* XP Badge */}
        <div className="hidden sm:flex items-center bg-amber-50 border border-amber-200/80 rounded-full px-3 py-1 gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-amber-700">
            {user?.xp || 0} XP
          </span>
        </div>

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
