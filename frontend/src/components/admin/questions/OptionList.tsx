import { Plus, Trash2 } from 'lucide-react';
import { type Option } from '@/services/questions.service';

interface OptionListProps {
  options: Option[];
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  errors: Record<string, string>;
  disabled: boolean;
  onChange: (options: Option[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function OptionList({
  options,
  type,
  errors,
  disabled,
  onChange,
  onAdd,
  onRemove,
}: OptionListProps) {
  const handleOptionChange = (
    index: number,
    field: 'text' | 'isCorrect',
    value: string | boolean,
  ) => {
    const updated = options.map((opt, i) => {
      if (i === index) return { ...opt, [field]: value };
      // For SINGLE_CHOICE, uncheck others when marking one correct
      if (type === 'SINGLE_CHOICE' && field === 'isCorrect' && value === true) {
        return { ...opt, isCorrect: false };
      }
      return opt;
    });
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          Alternativas <span className="text-rose-500">*</span>
        </label>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </button>
      </div>

      {errors.options && (
        <p className="mb-3 text-sm text-rose-600 font-medium">{errors.options}</p>
      )}

      <div className="space-y-2.5">
        {options.map((option, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3.5 border rounded-2xl transition-all ${
              option.isCorrect
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className="flex flex-col items-center gap-1 mt-2.5 shrink-0">
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={(e) =>
                  handleOptionChange(index, 'isCorrect', e.target.checked)
                }
                disabled={disabled}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500/30"
              />
              <span
                className={`text-[9px] font-bold uppercase tracking-wide ${
                  option.isCorrect ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {option.isCorrect ? 'Correta' : 'Errada'}
              </span>
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={option.text}
                onChange={(e) =>
                  handleOptionChange(index, 'text', e.target.value)
                }
                disabled={disabled}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                  errors[`option_${index}`]
                    ? 'border-rose-300 bg-rose-50 focus:ring-rose-500/20 focus:border-rose-400 text-rose-800'
                    : option.isCorrect
                    ? 'border-emerald-200 bg-white focus:ring-emerald-500/20 focus:border-emerald-400 text-slate-800'
                    : 'border-slate-200 bg-white focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-700'
                }`}
                placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
              />
              {errors[`option_${index}`] && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors[`option_${index}`]}
                </p>
              )}
            </div>

            {options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all mt-1.5 shrink-0"
                title="Remover alternativa"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
