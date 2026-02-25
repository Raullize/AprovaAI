import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
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

      <div className="flex items-center space-x-4">
        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <span className="sr-only">Notificações</span>
          <Bell className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-3 border-l border-gray-200 pl-4 ml-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
            {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
