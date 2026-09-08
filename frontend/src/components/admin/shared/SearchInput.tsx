import { Search } from 'lucide-react';
import { cn } from '../../../lib/utils';

type SearchInputSize = 'sm' | 'lg';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: SearchInputSize;
  className?: string;
}

const inputStyles: Record<SearchInputSize, string> = {
  sm: 'pl-10 pr-4 py-2.5 text-sm font-medium placeholder-slate-400',
  lg: 'pl-12 pr-4 py-4 shadow-sm',
};

const iconContainerStyles: Record<SearchInputSize, string> = {
  sm: 'pl-3.5',
  lg: 'pl-4',
};

const iconStyles: Record<SearchInputSize, string> = {
  sm: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  size = 'sm',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'absolute inset-y-0 left-0 flex items-center pointer-events-none',
          iconContainerStyles[size],
        )}
      >
        <Search className={cn('text-slate-400', iconStyles[size])} />
      </div>
      <input
        type="text"
        className={cn(
          'block w-full border border-slate-200 rounded-2xl leading-5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
          inputStyles[size],
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
