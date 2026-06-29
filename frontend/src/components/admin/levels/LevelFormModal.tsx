import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { levelsService } from '@/services/levels.service';
import { useToast } from '@/hooks/useToast';
import type { SimulationMode } from '@/types/simulation.types';

interface LevelFormData {
  name: string;
  xpReward: number;
  passingPercentage: number;
  timeLimitHours?: number;
  timeLimitMinutes?: number;
  timeLimitSeconds?: number;
  simulationMode: SimulationMode;
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
    defaultValues: { status: 'ACTIVE', topicId, simulationMode: 'PRACTICE' },
  });

  const statusValue = watch('status');
  const timeLimitHoursVal = watch('timeLimitHours');
  const timeLimitMinutesVal = watch('timeLimitMinutes');
  const timeLimitSecondsVal = watch('timeLimitSeconds');

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && levelId) {
      const load = async () => {
        try {
          setIsLoading(true);
          const level = await levelsService.findOne(levelId);
          let h = 0;
          let m = 0;
          let s = 0;
          if (level.timeLimit) {
            h = Math.floor(level.timeLimit / 3600);
            m = Math.floor((level.timeLimit % 3600) / 60);
            s = level.timeLimit % 60;
          }
          reset({
            name: level.name,
            xpReward: level.xpReward,
            passingPercentage: level.passingPercentage,
            timeLimitHours: h || undefined,
            timeLimitMinutes: m || undefined,
            timeLimitSeconds: s || undefined,
            simulationMode: level.simulationMode || 'PRACTICE',
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
        timeLimitHours: undefined,
        timeLimitMinutes: undefined,
        timeLimitSeconds: undefined,
        simulationMode: 'PRACTICE',
      });
    }
  }, [isOpen, levelId, isEditing, topicId, reset, toast]);

  const onSubmit = async (data: LevelFormData) => {
    try {
      setIsSaving(true);
      const h = Number(data.timeLimitHours || 0);
      const m = Number(data.timeLimitMinutes || 0);
      const s = Number(data.timeLimitSeconds || 0);
      const totalSeconds = (h * 3600) + (m * 60) + s;

      const { timeLimitHours, timeLimitMinutes, timeLimitSeconds, ...rest } = data;
      const basePayload = {
        ...rest,
        xpReward: Number(data.xpReward),
        passingPercentage: Number(data.passingPercentage),
        simulationMode: data.simulationMode,
      };

      if (isEditing && levelId) {
        await levelsService.update(levelId, {
          ...basePayload,
          timeLimit: totalSeconds > 0 ? totalSeconds : null,
        });
        toast({ title: 'Nível atualizado!', variant: 'success' });
      } else {
        await levelsService.create({ 
          ...basePayload, 
          topicId,
          timeLimit: totalSeconds > 0 ? totalSeconds : undefined,
        });
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Tempo Limite
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="00"
                    {...register('timeLimitHours', {
                      min: { value: 0, message: 'Mínimo 0' }
                    })}
                    error={errors.timeLimitHours?.message}
                    className="text-center"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block text-center">horas</span>
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="00"
                    {...register('timeLimitMinutes', {
                      min: { value: 0, message: 'Mínimo 0' },
                      max: { value: 59, message: 'Máximo 59' }
                    })}
                    error={errors.timeLimitMinutes?.message}
                    className="text-center"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block text-center">minutos</span>
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="00"
                    {...register('timeLimitSeconds', {
                      min: { value: 0, message: 'Mínimo 0' },
                      max: { value: 59, message: 'Máximo 59' }
                    })}
                    error={errors.timeLimitSeconds?.message}
                    className="text-center"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block text-center">segundos</span>
                </div>
              </div>
              {(() => {
                const hours = Number(timeLimitHoursVal || 0);
                const mins = Number(timeLimitMinutesVal || 0);
                const secs = Number(timeLimitSecondsVal || 0);
                if (hours > 0 || mins > 0 || secs > 0) {
                  const pad = (num: number) => String(num).padStart(2, '0');
                  const hms = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
                  return (
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Visualização: <strong className="text-indigo-650">{hms}</strong>
                    </span>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Modo de Simulação
              </label>
              <select
                {...register('simulationMode')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="PRACTICE">Prática</option>
                <option value="EXAM">Exame</option>
              </select>
            </div>
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
