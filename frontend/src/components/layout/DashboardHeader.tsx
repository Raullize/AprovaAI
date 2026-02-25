import React from 'react';
import { Menu, Bell, User as UserIcon, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1">
          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
          <span className="text-sm font-semibold text-gray-700">{user?.xp || 0} XP</span>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
          <span className="sr-only">Notificações</span>
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="flex flex-col items-end">
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
