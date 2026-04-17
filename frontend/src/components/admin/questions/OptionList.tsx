import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
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
        <label className="block text-sm font-medium text-gray-700">
          Alternativas <span className="text-red-500">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>

      {errors.options && (
        <p className="mb-3 text-sm text-red-600">{errors.options}</p>
      )}

      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex items-center gap-2 mt-2.5 shrink-0">
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={(e) =>
                  handleOptionChange(index, 'isCorrect', e.target.checked)
                }
                disabled={disabled}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Correta
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                  errors[`option_${index}`]
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
              />
              {errors[`option_${index}`] && (
                <p className="mt-1 text-xs text-red-600">
                  {errors[`option_${index}`]}
                </p>
              )}
            </div>

            {options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors mt-1 shrink-0"
                title="Remover alternativa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
