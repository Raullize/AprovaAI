import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: BreadcrumbItem[];
  backHref?: string;
  action: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbItems,
  backHref,
  action,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex flex-col gap-4">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}

        <div>
          <div className="flex items-center">
            {backHref && (
              <button
                onClick={() => navigate(backHref)}
                className="mr-3 p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full md:hidden transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      {action}
    </div>
  );
}
