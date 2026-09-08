import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { examsService } from '@/services/exams.service';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';
import {
  ICON_OPTIONS,
  COLOR_OPTIONS,
  getIconOption,
  getColorOption,
} from '@/config/examThemes';
import { cn } from '@/lib/utils';

interface ExamFormData {
  name: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT';
  iconKey: string;
  colorScheme: string;
  category: string;
}

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  examId?: string;
}

export function ExamFormModal({
  isOpen,
  onClose,
  onSuccess,
  examId,
}: ExamFormModalProps) {
  const isEditing = !!examId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ExamFormData>({
    defaultValues: {
      status: 'PUBLISHED',
      description: '',
      iconKey: ICON_OPTIONS[0].key,
      colorScheme: COLOR_OPTIONS[0].key,
      category: 'OUTROS',
    },
  });

  const statusValue = watch('status');
  const iconKeyValue = watch('iconKey');
  const colorSchemeValue = watch('colorScheme');

  const selectedColor = getColorOption(colorSchemeValue);
  const SelectedIcon = getIconOption(iconKeyValue).Icon;

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && examId) {
      const loadExam = async () => {
        try {
          setIsLoading(true);
          const exam = await examsService.findOne(examId);
          reset({
            name: exam.name,
            status: exam.status,
            description: exam.description || '',
            iconKey: exam.iconKey || ICON_OPTIONS[0].key,
            colorScheme: exam.colorScheme || COLOR_OPTIONS[0].key,
            category: exam.category || 'OUTROS',
          });
        } catch {
          toast({
            title: 'Erro ao carregar dados',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadExam();
    } else {
      reset({
        status: 'PUBLISHED',
        description: '',
        name: '',
        iconKey: ICON_OPTIONS[0].key,
        colorScheme: COLOR_OPTIONS[0].key,
        category: 'OUTROS',
      });
    }
  }, [isOpen, examId, isEditing, reset, toast]);

  const onSubmit = async (data: ExamFormData) => {
    try {
      setIsSaving(true);
      if (isEditing && examId) {
        await examsService.update(examId, data);
        toast({ title: 'Exame atualizado!', variant: 'success' });
      } else {
        await examsService.create(data);
        toast({ title: 'Exame criado com sucesso!', variant: 'success' });
      }
      onSuccess();
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const fieldLabel =
    'block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5';
  const fieldInput =
    'w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white text-slate-800 text-sm font-medium';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Exame' : 'Novo Exame'}
      size="lg"
    >
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loading size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nome do Exame"
            placeholder="Ex: ENEM 2026"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={errors.name?.message}
          />

          <div className="space-y-1.5">
            <label className={fieldLabel}>Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              disabled={isSaving}
              placeholder="Descreva brevemente o exame..."
              className={`${fieldInput} resize-none`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={fieldLabel}>Categoria</label>
            <select
              {...register('category')}
              disabled={isSaving}
              className={fieldInput}
            >
              <option value="CONCURSOS">Concursos</option>
              <option value="CERTIFICACOES">Certificações</option>
              <option value="VESTIBULAR">Vestibular</option>
              <option value="OAB">OAB</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner',
                selectedColor.gradient,
              )}
            >
              <SelectedIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                Preview
              </p>
              <p className="font-bold text-slate-800">
                {watch('name') || 'Nome do Exame'}
              </p>
            </div>
          </div>

          {/* Icon picker */}
          <div className="space-y-3">
            <label className={fieldLabel}>Ícone</label>
            <input type="hidden" {...register('iconKey')} />
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  title={label}
                  onClick={() =>
                    setValue('iconKey', key, { shouldDirty: true })
                  }
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-semibold',
                    iconKeyValue === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/50',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate w-full text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-3">
            <label className={fieldLabel}>Cor do Tema</label>
            <input type="hidden" {...register('colorScheme')} />
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map(({ key, label, gradient }) => (
                <button
                  key={key}
                  type="button"
                  title={label}
                  onClick={() =>
                    setValue('colorScheme', key, { shouldDirty: true })
                  }
                  className={cn(
                    'w-10 h-10 rounded-full bg-gradient-to-br shadow-sm transition-all',
                    gradient,
                    colorSchemeValue === key
                      ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110'
                      : 'hover:scale-105',
                  )}
                />
              ))}
            </div>
          </div>

          <StatusToggle
            value={statusValue}
            onChange={(v) => setValue('status', v, { shouldDirty: true })}
            disabled={isSaving}
          />
          <input type="hidden" {...register('status')} />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all text-sm shadow-md shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <Loading size="sm" />
              ) : isEditing ? (
                'Salvar'
              ) : (
                'Criar Exame'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
