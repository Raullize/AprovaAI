'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { User } from 'lucide-react';
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bem-vindo de volta, {session?.user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Continue sua jornada de estudos e alcance seus objetivos.
              </p>
            </div>
            
            {/* User Info */}
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
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}