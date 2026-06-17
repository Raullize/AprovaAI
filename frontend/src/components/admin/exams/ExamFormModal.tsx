import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { examsService } from '@/services/exams.service';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ICON_OPTIONS, COLOR_OPTIONS, getIconOption, getColorOption } from '@/config/examThemes';
import { cn } from '@/lib/utils';

interface ExamFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
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
      status: 'ACTIVE',
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
      reset({ status: 'ACTIVE', description: '', name: '', iconKey: ICON_OPTIONS[0].key, colorScheme: COLOR_OPTIONS[0].key, category: 'OUTROS' });
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Exame' : 'Novo Exame'} size="lg">
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loading size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do Exame"
            placeholder="Ex: ENEM 2026"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={errors.name?.message}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Categoria</label>
            <select
              {...register('category')}
              disabled={isSaving}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner', selectedColor.gradient)}>
              <SelectedIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Preview</p>
              <p className="font-bold text-slate-800">{watch('name') || 'Nome do Exame'}</p>
            </div>
          </div>

          {/* Icon picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ícone</label>
            <input type="hidden" {...register('iconKey')} />
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  title={label}
                  onClick={() => setValue('iconKey', key, { shouldDirty: true })}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                    iconKeyValue === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate w-full text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cor</label>
            <input type="hidden" {...register('colorScheme')} />
            <div className="flex flex-wrap gap-4">
              {COLOR_OPTIONS.map(({ key, label, gradient }) => (
                <button
                  key={key}
                  type="button"
                  title={label}
                  onClick={() => setValue('colorScheme', key, { shouldDirty: true })}
                  className={cn(
                    'w-10 h-10 rounded-full bg-gradient-to-br shadow-sm transition-all',
                    gradient,
                    colorSchemeValue === key
                      ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110'
                      : 'hover:scale-105'
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loading size="sm" /> : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
