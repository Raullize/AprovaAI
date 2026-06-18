import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-slate-500 text-sm font-medium">{message}</p>
    </div>
  );
}
