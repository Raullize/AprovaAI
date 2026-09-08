import React, { forwardRef } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  inputSize?: 'md' | 'lg';
  labelStyle?: 'default' | 'uppercase';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      className = '',
      showPasswordToggle = false,
      showPassword = false,
      onTogglePassword,
      type,
      inputSize = 'md',
      labelStyle = 'default',
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'w-full border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm text-slate-800 placeholder:text-slate-400';

    const sizeClasses = {
      md: 'px-3.5 py-2.5 rounded-xl',
      lg: 'px-4 py-3 rounded-2xl font-medium text-sm',
    };

    const focusClasses = error
      ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-500'
      : inputSize === 'lg'
        ? 'border-slate-200 bg-white hover:border-slate-300 focus:ring-indigo-500 focus:border-transparent'
        : 'border-slate-200 bg-white hover:border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-400';

    const labelClasses =
      labelStyle === 'uppercase'
        ? 'block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5'
        : 'block text-sm font-medium text-gray-700';

    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="space-y-2">
        {label && <label className={labelClasses}>{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              baseClasses,
              sizeClasses[inputSize],
              focusClasses,
              className,
            )}
            {...props}
          />
          {showPasswordToggle && onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
