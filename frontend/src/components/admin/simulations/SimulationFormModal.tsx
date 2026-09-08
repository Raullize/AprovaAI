import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { simulationsService } from '@/services/simulations.service';
import { useToast } from '@/hooks/useToast';
import type { SimulationMode } from '@/types/simulation.types';

interface SimulationFormData {
  name: string;
  xpReward: number;
  passingPercentage: number;
  timeLimitHours?: number;
  timeLimitMinutes?: number;
  timeLimitSeconds?: number;
  simulationMode: SimulationMode;
  topicId: string;
  status: 'PUBLISHED' | 'DRAFT';
}

interface SimulationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  topicId: string;
  simulationId?: string;
}

export function SimulationFormModal({
  isOpen,
  onClose,
  onSuccess,
  topicId,
  simulationId,
}: SimulationFormModalProps) {
  const isEditing = !!simulationId;
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
  } = useForm<SimulationFormData>({
    defaultValues: { status: 'PUBLISHED', topicId, simulationMode: 'PRACTICE' },
  });

  const statusValue = watch('status');
  const timeLimitHoursVal = watch('timeLimitHours');
  const timeLimitMinutesVal = watch('timeLimitMinutes');
  const timeLimitSecondsVal = watch('timeLimitSeconds');

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && simulationId) {
      const load = async () => {
        try {
          setIsLoading(true);
          const simulation = await simulationsService.findOne(simulationId);
          let h = 0;
          let m = 0;
          let s = 0;
          if (simulation.timeLimit) {
            h = Math.floor(simulation.timeLimit / 3600);
            m = Math.floor((simulation.timeLimit % 3600) / 60);
            s = simulation.timeLimit % 60;
          }
          reset({
            name: simulation.name,
            xpReward: simulation.xpReward,
            passingPercentage: simulation.passingPercentage,
            timeLimitHours: h || undefined,
            timeLimitMinutes: m || undefined,
            timeLimitSeconds: s || undefined,
            simulationMode: simulation.simulationMode || 'PRACTICE',
            status: simulation.status,
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
        status: 'PUBLISHED',
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
  }, [isOpen, simulationId, isEditing, topicId, reset, toast]);

  const onSubmit = async (data: SimulationFormData) => {
    try {
      setIsSaving(true);
      const h = Number(data.timeLimitHours || 0);
      const m = Number(data.timeLimitMinutes || 0);
      const s = Number(data.timeLimitSeconds || 0);
      const totalSeconds = h * 3600 + m * 60 + s;

      const basePayload = {
        name: data.name,
        topicId: data.topicId,
        status: data.status,
        xpReward: Number(data.xpReward),
        passingPercentage: Number(data.passingPercentage),
        simulationMode: data.simulationMode,
      };

      if (isEditing && simulationId) {
        await simulationsService.update(simulationId, {
          ...basePayload,
          timeLimit: totalSeconds > 0 ? totalSeconds : null,
        });
        toast({ title: 'Simulado atualizado!', variant: 'success' });
      } else {
        await simulationsService.create({
          ...basePayload,
          topicId,
          timeLimit: totalSeconds > 0 ? totalSeconds : undefined,
        });
        toast({ title: 'Simulado criado!', variant: 'success' });
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
      title={isEditing ? 'Editar Simulado' : 'Novo Simulado'}
    >
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loading size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nome do Simulado"
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
              <label className={fieldLabel}>Tempo Limite</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="00"
                    {...register('timeLimitHours', {
                      min: { value: 0, message: 'Mínimo 0' },
                    })}
                    error={errors.timeLimitHours?.message}
                    className="text-center"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block text-center font-medium">
                    horas
                  </span>
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="00"
                    {...register('timeLimitMinutes', {
                      min: { value: 0, message: 'Mínimo 0' },
                      max: { value: 59, message: 'Máximo 59' },
                    })}
                    error={errors.timeLimitMinutes?.message}
                    className="text-center"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block text-center font-medium">
                    minutos
                  </span>
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="00"
                    {...register('timeLimitSeconds', {
                      min: { value: 0, message: 'Mínimo 0' },
                      max: { value: 59, message: 'Máximo 59' },
                    })}
                    error={errors.timeLimitSeconds?.message}
                    className="text-center"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block text-center font-medium">
                    segundos
                  </span>
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
                      Visualização:{' '}
                      <strong className="text-indigo-600">{hms}</strong>
                    </span>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Modo de Simulação</label>
              <select {...register('simulationMode')} className={fieldInput}>
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
                'Criar Simulado'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
