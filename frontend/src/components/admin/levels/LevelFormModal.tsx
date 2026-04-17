import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { levelsService } from '@/services/levels.service';
import { useToast } from '@/hooks/use-toast';

interface LevelFormData {
  name: string;
  xpReward: number;
  passingPercentage: number;
  topicId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface LevelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  topicId: string;
  levelId?: string;
}

export function LevelFormModal({
  isOpen,
  onClose,
  onSuccess,
  topicId,
  levelId,
}: LevelFormModalProps) {
  const isEditing = !!levelId;
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
  } = useForm<LevelFormData>({
    defaultValues: { status: 'ACTIVE', topicId },
  });

  const statusValue = watch('status');

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && levelId) {
      const load = async () => {
        try {
          setIsLoading(true);
          const level = await levelsService.findOne(levelId);
          reset({
            name: level.name,
            xpReward: level.xpReward,
            passingPercentage: level.passingPercentage,
            status: level.status,
            topicId,
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
        status: 'ACTIVE',
        topicId,
        name: '',
        xpReward: 0,
        passingPercentage: 70,
      });
    }
  }, [isOpen, levelId, isEditing, topicId, reset, toast]);

  const onSubmit = async (data: LevelFormData) => {
    try {
      setIsSaving(true);
      const payload = {
        ...data,
        xpReward: Number(data.xpReward),
        passingPercentage: Number(data.passingPercentage),
      };
      if (isEditing && levelId) {
        await levelsService.update(levelId, payload);
        toast({ title: 'Nível atualizado!', variant: 'success' });
      } else {
        await levelsService.create({ ...payload, topicId });
        toast({ title: 'Nível criado!', variant: 'success' });
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
      title={isEditing ? 'Editar Nível' : 'Novo Nível'}
    >
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loading size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do Nível"
            placeholder="Ex: Fácil, Médio, Difícil"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={errors.name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Recompensa (XP)"
              type="number"
              {...register('xpReward', {
                required: 'XP é obrigatório',
                min: { value: 0, message: 'Deve ser maior ou igual a 0' },
              })}
              error={errors.xpReward?.message}
            />
            <Input
              label="Aprovação Mínima (%)"
              type="number"
              {...register('passingPercentage', {
                required: 'Porcentagem é obrigatória',
                min: { value: 0, message: 'Mínimo 0%' },
                max: { value: 100, message: 'Máximo 100%' },
              })}
              error={errors.passingPercentage?.message}
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
