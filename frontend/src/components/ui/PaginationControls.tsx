import { cn } from '../../lib/utils';
import { getPageNumbers } from '../../lib/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const navButtonClasses = (isDisabled: boolean) =>
    cn(
      'px-4 py-2 rounded-xl text-xs font-bold transition-all border',
      isDisabled
        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 shadow-sm',
    );

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 mt-8 pt-4 border-t border-slate-100',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navButtonClasses(currentPage === 1)}
      >
        Anterior
      </button>

      <div className="flex items-center gap-1.5">
        {getPageNumbers(currentPage, totalPages).map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-slate-400 font-bold text-xs"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              className={cn(
                'w-8 h-8 rounded-xl text-xs font-bold transition-all border',
                currentPage === page
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 shadow-sm',
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={navButtonClasses(currentPage === totalPages)}
      >
        Próximo
      </button>
    </div>
  );
}
