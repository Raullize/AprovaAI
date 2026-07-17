interface StatusToggleProps {
  value: 'PUBLISHED' | 'DRAFT';
  onChange: (value: 'PUBLISHED' | 'DRAFT') => void;
  disabled?: boolean;
}

export function StatusToggle({ value, onChange, disabled }: StatusToggleProps) {
  const isActive = value === 'PUBLISHED';

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
      <div>
        <p className="text-sm font-semibold text-slate-700">Visibilidade</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {isActive
            ? 'Publicado — acessível para os alunos'
            : 'Rascunho — oculto para os alunos'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange(isActive ? 'DRAFT' : 'PUBLISHED')}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 disabled:opacity-50 ${
          isActive ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
