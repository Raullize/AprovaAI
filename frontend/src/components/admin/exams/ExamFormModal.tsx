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

interface ExamFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
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
    defaultValues: { status: 'ACTIVE', description: '' },
  });

  const statusValue = watch('status');

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
          });
        } catch {
          toast({
            title: 'Erro ao carregar dados',
            description:
              'Não foi possível recuperar as informações deste exame.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadExam();
    } else {
      reset({ status: 'ACTIVE', description: '', name: '' });
    }
  }, [isOpen, examId, isEditing, reset, toast]);

  const onSubmit = async (data: ExamFormData) => {
    try {
      setIsSaving(true);
      if (isEditing && examId) {
        await examsService.update(examId, data);
        toast({
          title: 'Exame atualizado!',
          description: 'As informações do exame foram salvas com sucesso.',
          variant: 'success',
        });
      } else {
        await examsService.create(data);
        toast({
          title: 'Exame criado com sucesso!',
          description: 'O exame foi adicionado à plataforma.',
          variant: 'success',
        });
      }
      onSuccess();
    } catch {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Exame' : 'Novo Exame'}
    >
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loading size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do Exame"
            placeholder="Ex: ENEM"
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
