interface StatusBadgeProps {
  status: 'PUBLISHED' | 'DRAFT';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'PUBLISHED';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
          : 'bg-slate-100 text-slate-600 ring-slate-500/20'
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isActive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            isActive ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      </span>
      {isActive ? 'Publicado' : 'Rascunho'}
    </span>
  );
}
