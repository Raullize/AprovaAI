interface StatusToggleProps {
  value: 'ACTIVE' | 'INACTIVE';
  onChange: (value: 'ACTIVE' | 'INACTIVE') => void;
  disabled?: boolean;
}

export function StatusToggle({ value, onChange, disabled }: StatusToggleProps) {
  const isActive = value === 'ACTIVE';

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
      <div>
        <p className="text-sm font-medium text-gray-700">Visibilidade</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {isActive
            ? 'Público — acessível para os alunos'
            : 'Privado — bloqueado/oculto para os alunos'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange(isActive ? 'INACTIVE' : 'ACTIVE')}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
          isActive ? 'bg-primary-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
