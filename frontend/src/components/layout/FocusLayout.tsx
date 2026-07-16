import React from 'react';
import { Outlet } from 'react-router-dom';

export const FocusLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
