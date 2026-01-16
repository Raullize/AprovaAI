'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { User, Trophy, Bell } from 'lucide-react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bem-vindo, {session?.user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                {session?.user?.role === 'ADMIN' 
                  ? 'Gerencie a plataforma e acompanhe o desempenho dos usuários.'
                  : 'Explore seus estudos e conquiste novos conhecimentos.'
                }
              </p>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 mr-2">
                <div className="flex items-center space-x-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700">{session?.user?.xp || 0} XP</span>
                </div>
                
                <button className="relative p-1 text-gray-500 hover:text-primary-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0.5 right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                
                <div className="h-6 w-px bg-gray-200" />
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
