'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  Settings, 
  BarChart3, 
  User, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Início',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Simulados',
    href: '/dashboard/exams',
    icon: BarChart3,
  },
  {
    name: 'Conquistas',
    href: '/dashboard/achievements',
    icon: Trophy,
  },
  {
    name: 'Perfil',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className={cn('flex items-center', isCollapsed && 'justify-center')}>
          <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="ml-3 text-lg font-bold text-gray-900">AprovaAI</span>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-1.5 rounded-lg hover:bg-gray-100 transition-colors',
            isCollapsed && 'absolute -right-3 top-4 bg-white border border-gray-200 shadow-sm'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700',
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? 'Sair' : undefined}
        >
          <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}