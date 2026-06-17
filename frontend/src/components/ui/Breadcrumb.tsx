import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxLength?: number;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, maxLength = 25 }) => {

  return (
    <nav aria-label="Breadcrumb">
      {/* Desktop view: Breadcrumb completo */}
      <ol className="flex flex-wrap items-center space-x-2">
        {items.map((item, index) => {
          const truncatedLabel =
            item.label.length > maxLength
              ? item.label.slice(0, maxLength) + '...'
              : item.label;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mr-2" />
              )}
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 truncate max-w-none transition-colors"
                  title={item.label}
                >
                  {truncatedLabel}
                </Link>
              ) : (
                <span
                  className="text-sm font-medium text-slate-900 truncate max-w-[200px]"
                  title={item.label}
                >
                  {truncatedLabel}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
