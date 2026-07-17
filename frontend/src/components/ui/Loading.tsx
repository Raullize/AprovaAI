import React from 'react';

interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className = '',
  fullScreen = false,
}) => {
  const sizeClasses = {
    xs: { spinner: 'w-4 h-4', text: 'text-xs' },
    sm: { spinner: 'w-8 h-8', text: 'text-sm' },
    md: { spinner: 'w-12 h-12', text: 'text-base' },
    lg: { spinner: 'w-16 h-16', text: 'text-lg' },
  };

  const currentSize = sizeClasses[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div
        className={`${currentSize.spinner} border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin`}
      ></div>

      {text && (
        <div className="text-center">
          <p
            className={`${currentSize.text} font-medium text-slate-500 animate-pulse`}
          >
            {text}
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="text-center">
          {content}
          {!text && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-slate-700 mb-1">
                AprovaAI
              </h3>
              <p className="text-slate-400 text-sm">
                Carregando sua experiência de estudos...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
