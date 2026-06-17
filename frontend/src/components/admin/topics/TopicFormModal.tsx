import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { topicsService } from '@/services/topics.service';
import { useToast } from '@/hooks/use-toast';
import { ICON_OPTIONS, COLOR_OPTIONS, getIconOption, getColorOption } from '@/config/examThemes';
import { cn } from '@/lib/utils';

interface TopicFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  examId: string;
  iconKey: string;
  colorScheme: string;
}

interface TopicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  examId: string;
  topicId?: string;
}

export function TopicFormModal({
  isOpen,
  onClose,
  onSuccess,
  examId,
  topicId,
}: TopicFormModalProps) {
  const isEditing = !!topicId;
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
  } = useForm<TopicFormData>({
    defaultValues: {
      status: 'ACTIVE',
      examId,
      iconKey: ICON_OPTIONS[0].key,
      colorScheme: COLOR_OPTIONS[0].key,
    },
  });

  const statusValue = watch('status');
  const iconKeyValue = watch('iconKey');
  const colorSchemeValue = watch('colorScheme');

  const selectedColor = getColorOption(colorSchemeValue);
  const SelectedIcon = getIconOption(iconKeyValue).Icon;

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && topicId) {
      const load = async () => {
        try {
          setIsLoading(true);
          const topic = await topicsService.findOne(topicId);
          reset({
            name: topic.name,
            description: topic.description || '',
            status: topic.status,
            examId,
            iconKey: topic.iconKey || ICON_OPTIONS[0].key,
            colorScheme: topic.colorScheme || COLOR_OPTIONS[0].key,
          });
        } catch {
          toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };
      load();
    } else {
      reset({ status: 'ACTIVE', description: '', name: '', examId, iconKey: ICON_OPTIONS[0].key, colorScheme: COLOR_OPTIONS[0].key });
    }
  }, [isOpen, topicId, isEditing, examId, reset, toast]);

  const onSubmit = async (data: TopicFormData) => {
    try {
      setIsSaving(true);
      if (isEditing && topicId) {
        await topicsService.update(topicId, data);
        toast({ title: 'Tópico atualizado!', variant: 'success' });
      } else {
        await topicsService.create({ ...data, examId });
        toast({ title: 'Tópico criado!', variant: 'success' });
      }
      onSuccess();
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Tópico' : 'Novo Tópico'} size="lg">
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loading size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do Tópico"
            placeholder="Ex: Conceitos de Nuvem"
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

          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner', selectedColor.gradient)}>
              <SelectedIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Preview</p>
              <p className="font-bold text-slate-800">{watch('name') || 'Nome do Tópico'}</p>
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
