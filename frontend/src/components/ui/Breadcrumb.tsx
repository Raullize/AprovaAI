import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();

  const goBack = () => {
    for (let i = items.length - 2; i >= 0; i--) {
      if (items[i].href && items[i].href !== '#') {
        navigate(items[i].href as string);
        return;
      }
    }
    navigate(-1);
  };

  const getBackLabel = () => {
    for (let i = items.length - 2; i >= 0; i--) {
      if (items[i].href && items[i].href !== '#') {
        return items[i].label.replace('...', '').trim();
      }
    }
    return '';
  };

  const backLabel = getBackLabel();

  return (
    <nav aria-label="Breadcrumb">
      {/* Mobile view: Voltar */}
      <div className="flex md:hidden items-center">
        {items.length > 1 ? (
          <button
            onClick={goBack}
            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md border border-primary-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar {backLabel ? `para ${backLabel}` : ''}
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md">
              {items[0]?.label}
            </span>
          </div>
        )}
      </div>

      {/* Desktop view: Breadcrumb completo */}
      <ol className="hidden md:flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />}
            {item.href ? (
              <Link
                to={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 truncate max-w-none"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900 truncate max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
