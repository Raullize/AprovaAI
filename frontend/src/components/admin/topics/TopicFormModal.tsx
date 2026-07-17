import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { topicsService } from '@/services/topics.service';
import { useToast } from '@/hooks/useToast';
import {
  ICON_OPTIONS,
  COLOR_OPTIONS,
  getIconOption,
  getColorOption,
} from '@/config/examThemes';
import { cn } from '@/lib/utils';

interface TopicFormData {
  name: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT';
  showComingSoon: boolean;
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
      status: 'PUBLISHED',
      showComingSoon: false,
      examId,
      iconKey: ICON_OPTIONS[0].key,
      colorScheme: COLOR_OPTIONS[0].key,
    },
  });

  const statusValue = watch('status');
  const showComingSoonValue = watch('showComingSoon');
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
            showComingSoon: topic.showComingSoon || false,
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
      reset({
        status: 'PUBLISHED',
        showComingSoon: false,
        description: '',
        name: '',
        examId,
        iconKey: ICON_OPTIONS[0].key,
        colorScheme: COLOR_OPTIONS[0].key,
      });
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

  const fieldLabel =
    'block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5';
  const fieldInput =
    'w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white text-slate-800 text-sm font-medium';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Tópico' : 'Novo Tópico'}
      size="lg"
    >
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loading size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nome do Tópico"
            placeholder="Ex: Conceitos de Nuvem"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={errors.name?.message}
          />

          <div className="space-y-1.5">
            <label className={fieldLabel}>Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              disabled={isSaving}
              placeholder="Descreva brevemente o tópico..."
              className={`${fieldInput} resize-none`}
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner',
                selectedColor.gradient,
              )}
            >
              <SelectedIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                Preview
              </p>
              <p className="font-bold text-slate-800">
                {watch('name') || 'Nome do Tópico'}
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

          {/* Coming Soon Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Indicador de Em Breve
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {showComingSoonValue
                  ? 'O tópico aparece para o aluno mesmo sem simulados publicados e mostra uma etapa final de "Em breve".'
                  : 'O tópico só aparece para o aluno quando tiver pelo menos um simulado publicado.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setValue('showComingSoon', !showComingSoonValue, {
                  shouldDirty: true,
                })
              }
              disabled={isSaving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 disabled:opacity-50 ${
                showComingSoonValue ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  showComingSoonValue ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <input
            type="hidden"
            {...register('showComingSoon', {
              setValueAs: (value) => value === true || value === 'true',
            })}
          />

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
                'Criar Tópico'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
