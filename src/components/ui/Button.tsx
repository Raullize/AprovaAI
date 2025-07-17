import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg transform hover:-translate-y-0.5',
    secondary: 'bg-success-600 hover:bg-success-700 text-white hover:shadow-lg transform hover:-translate-y-0.5',
    outline: 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
  };
  
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}; 