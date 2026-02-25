import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />}
            {item.href ? (
              <Link 
                to={item.href} 
                className="text-sm font-medium text-gray-500 hover:text-gray-700 truncate max-w-[150px] md:max-w-none"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900 truncate max-w-[150px] md:max-w-none">
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
