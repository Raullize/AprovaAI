import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gamified';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'font-semibold rounded-xl transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 focus:ring-indigo-500',
    secondary:
      'bg-slate-800 hover:bg-slate-900 text-white hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-slate-800',
    outline:
      'bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-indigo-500',
    gamified:
      'bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 shadow-md focus:ring-indigo-500',
  };

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-sm',
    lg: 'py-2.5 px-5 text-base',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
