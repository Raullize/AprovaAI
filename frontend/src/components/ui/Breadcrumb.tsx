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

  return (
    <nav aria-label="Breadcrumb">
      {/* Mobile view: Voltar */}
      <div className="flex md:hidden items-center">
        {items.length > 1 ? (
          <button
            onClick={goBack}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2 text-gray-400" />
            Voltar
          </button>
        ) : (
          <span className="text-sm font-medium text-gray-900">{items[0]?.label}</span>
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
