import React from 'react';
import { GraduationCap } from 'lucide-react';

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
    xs: { spinner: 'w-4 h-4', icon: 'w-2 h-2', text: 'text-xs' },
    sm: { spinner: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    md: { spinner: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base' },
    lg: { spinner: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-lg' },
  };

  const currentSize = sizeClasses[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="relative">
        <div
          className={`${currentSize.spinner} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
        ></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary-600 rounded-full p-2 animate-pulse">
            <GraduationCap className={`${currentSize.icon} text-white`} />
          </div>
        </div>

        <div
          className={`absolute inset-2 border-2 border-primary-300 rounded-full animate-ping opacity-20`}
        ></div>
      </div>

      {text && (
        <div className="text-center">
          <p
            className={`${currentSize.text} font-medium text-primary-700 animate-pulse`}
          >
            {text}
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          {content}
          {!text && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-primary-700 mb-2">
                AprovaAI
              </h3>
              <p className="text-primary-600">
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
