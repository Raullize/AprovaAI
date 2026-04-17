import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { topicsService } from '@/services/topics.service';
import { useToast } from '@/hooks/use-toast';

interface TopicFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  examId: string;
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
    defaultValues: { status: 'ACTIVE', examId },
  });

  const statusValue = watch('status');

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
          });
        } catch {
          toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };
      load();
    } else {
      reset({ status: 'ACTIVE', description: '', name: '', examId });
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Tópico' : 'Novo Tópico'}
    >
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loading size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do Tópico"
            placeholder="Ex: Matemática Básica"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={errors.name?.message}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              {...register('description')}
              rows={3}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <StatusToggle
            value={statusValue}
            onChange={(v) => setValue('status', v, { shouldDirty: true })}
            disabled={isSaving}
          />
          <input type="hidden" {...register('status')} />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loading size="sm" />
              ) : isEditing ? (
                'Salvar'
              ) : (
                'Criar'
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
