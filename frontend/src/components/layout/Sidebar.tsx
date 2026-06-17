import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  User,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const studentItems = [
  { icon: Home, label: 'Início', href: '/dashboard' },
  { icon: Compass, label: 'Explorar', href: '/dashboard/explore' },
  { icon: User, label: 'Perfil', href: '/dashboard/profile' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

const adminItems = [
  { icon: Home, label: 'Início', href: '/dashboard' },
  { icon: BookOpen, label: 'Exames', href: '/dashboard/exams' },
  { icon: Users, label: 'Usuários', href: '/dashboard/users' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = user?.role === 'ADMIN' ? adminItems : studentItems;

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const isRouteActive = (href: string, currentPath: string) => {
    if (href === '/dashboard') {
      return currentPath === href;
    }

    if (href === '/dashboard/exams') {
      return (
        currentPath === href ||
        currentPath.startsWith('/dashboard/admin/exams') ||
        currentPath.startsWith('/dashboard/admin/topics') ||
        currentPath.startsWith('/dashboard/admin/levels')
      );
    }

    return currentPath.startsWith(href);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user?.username?.[0]?.toUpperCase() ?? '?');

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-sidebar-bg h-screen fixed left-0 top-0 z-30 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        {/* Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-6 w-6 h-6 bg-slate-800 border-2 border-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-40"
            title={isCollapsed ? 'Expandir' : 'Recolher'}
          >
            <svg
              className={cn(
                'w-3 h-3 transition-transform duration-300',
                isCollapsed ? 'rotate-180' : '',
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-5 border-b border-sidebar-border shrink-0">
          <div
            className={cn(
              'flex items-center',
              isCollapsed ? 'justify-center' : 'space-x-2.5 w-full',
            )}
          >
            <div className="w-8 h-8 rounded-xl flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold font-display text-white tracking-tight truncate">
                AprovaAI
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5">
          {!isCollapsed && (
            <div className="px-3 mb-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-text/50 mb-2 truncate">
                {user?.role === 'ADMIN' ? 'Administração' : 'Menu'}
              </p>
            </div>
          )}
          <ul className="space-y-0.5 px-3">
            {sidebarItems.map((item) => {
              const active = isRouteActive(item.href, location.pathname);
              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={cn(
                      'relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group',
                      active
                        ? 'bg-sidebar-active text-sidebar-text-active'
                        : 'text-sidebar-text hover:bg-sidebar-hover hover:text-slate-200',
                      isCollapsed && 'justify-center px-0',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 flex-shrink-0 transition-colors',
                        !isCollapsed && 'mr-3',
                        active
                          ? 'text-sidebar-icon-active'
                          : 'text-sidebar-text group-hover:text-slate-300',
                      )}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                    {!isCollapsed && active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    )}
                    {isCollapsed && (
                      <span className="absolute left-14 bg-slate-900 text-slate-100 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-lg translate-x-1 group-hover:translate-x-2">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer — User info + Logout */}
        <div className="p-3 shrink-0 border-t border-sidebar-border">
          <div
            className={cn(
              'flex rounded-xl bg-slate-800/40 border border-white/5 transition-all',
              isCollapsed ? 'flex-col items-center p-2 gap-2' : 'items-center gap-3 px-3 py-2',
            )}
          >
            <div
              className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-indigo-500/30"
            >
              {initials}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-sm font-semibold text-slate-200 truncate">
                    {user?.fullName || user?.username || 'Usuário'}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'email@exemplo.com'}
                  </span>
                </div>
              </>
            )}
            <button
              onClick={handleSignOut}
              className={cn(
                "text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0",
                isCollapsed ? "p-2 w-full flex justify-center" : "p-1.5"
              )}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex justify-around items-center shadow-2xl">
        {sidebarItems.map((item) => {
          const active = isRouteActive(item.href, location.pathname);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all duration-150 gap-0.5',
                active
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-slate-500 hover:text-red-400 transition-all duration-150 gap-0.5"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </nav>
    </>
  );
};
