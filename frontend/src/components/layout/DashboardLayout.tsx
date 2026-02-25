import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { Outlet } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay (simplificado - melhoria futura: usar componente de modal/drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
           <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
           <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full">
             <Sidebar /> {/* Reutilizando Sidebar, precisaria adaptar para mobile se quisesse fechar ao clicar */}
           </div>
        </div>
      )}
    </div>
  );
};
