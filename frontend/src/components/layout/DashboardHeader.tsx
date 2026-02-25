import React from 'react';
import { Bell, User as UserIcon, Star, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      
      {/* Mobile Logo (Left) */}
      <div className="flex items-center space-x-2 md:hidden">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold font-display text-gray-900">
          AprovaAI
        </span>
      </div>

      {/* Right Side Content */}
      <div className="flex items-center justify-end flex-1 space-x-4 md:space-x-6">
        
        {/* XP Display (Always visible now, but maybe smaller on mobile) */}
        <div className="flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 mr-1 fill-yellow-500" />
          <span className="text-xs md:text-sm font-semibold text-gray-700">{user?.xp || 0} XP</span>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
          <span className="sr-only">Notificações</span>
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-700">{user?.username || user?.fullName || 'Estudante'}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm text-primary-700 font-bold">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
          </div>
        </div>
      </div>
    </header>
  );
};
