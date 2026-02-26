import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Users, Settings, LogOut, GraduationCap, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

// Itens para ESTUDANTES (Padrão)
const studentItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: GraduationCap, label: 'Simulados', href: '/dashboard/simulations' },
  { icon: User, label: 'Perfil', href: '/dashboard/profile' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

// Itens para ADMIN (Início, Simulados, Usuários, Configurações)
const adminItems = [
  { icon: Home, label: 'Início', href: '/dashboard' },
  { icon: BookOpen, label: 'Exames', href: '/dashboard/exams' }, // Rota /exams agora é "Exames" no menu
  { icon: Users, label: 'Usuários', href: '/dashboard/users' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Seleciona o menu baseado na role
  const sidebarItems = user?.role === 'ADMIN' ? adminItems : studentItems;

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-gray-900">
              AprovaAI
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                      isActive
                        ? "bg-primary-50 text-primary-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )
                  }
                  end={item.href === '/dashboard'}
                >
                  <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0", ({ isActive }: { isActive: boolean }) => isActive ? "text-primary-600" : "text-gray-400")} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-2 flex justify-between items-center shadow-lg safe-area-bottom">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200",
                isActive
                  ? "text-primary-600"
                  : "text-gray-400 hover:text-gray-600"
              )
            }
            end={item.href === '/dashboard'}
          >
            <item.icon className="h-6 w-6" />
          </NavLink>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 transition-colors duration-200"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </nav>
    </>
  );
};
