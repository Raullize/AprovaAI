import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10">
        <div className="mb-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white hover:scale-105 transition-transform"
          >
            <GraduationCap className="h-7 w-7" />
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-slate-900 mb-2 tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-6 sm:p-8 animate-modal-in">
          {children}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
