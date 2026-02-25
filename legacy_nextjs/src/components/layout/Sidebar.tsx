'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  Settings, 
  BarChart3, 
  User, 
  GraduationCap,
  LogOut,
  Shield
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

const adminNavigation = [
  {
    name: 'Início',
    href: '/admin',
    icon: Home,
  },
  {
    name: 'Simulados',
    href: '/admin/exams',
    icon: BookOpen,
  },
  {
    name: 'Usuários',
    href: '/admin/users',
    icon: User,
  },
  {
    name: 'Configurações',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const currentNavigation = session?.user?.role === 'ADMIN' ? adminNavigation : navigation;

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 text-lg font-bold text-gray-900">AprovaAI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {currentNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {currentNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                 key={item.name}
                 href={item.href}
                 className={cn(
                   'flex items-center justify-center p-3 rounded-lg transition-colors min-w-0 flex-1',
                   isActive
                     ? 'text-primary-700 bg-primary-50'
                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                 )}
               >
                 <item.icon className="h-6 w-6" />
               </Link>
            );
          })}
          <button
             onClick={() => signOut({ callbackUrl: '/' })}
             className="flex items-center justify-center p-3 rounded-lg transition-colors text-red-600 hover:text-red-700 hover:bg-red-50 min-w-0 flex-1"
           >
             <LogOut className="h-6 w-6" />
           </button>
        </div>
      </div>
    </>
  );
}
