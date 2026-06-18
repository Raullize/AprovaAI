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
    <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0 pb-5 mb-2 border-b border-slate-200">
      <div className="flex flex-col gap-2">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} />
        )}

        <div>
          <div className="flex items-center gap-2">
            {backHref && (
              <button
                onClick={() => navigate(backHref)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}
