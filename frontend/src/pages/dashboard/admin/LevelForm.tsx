import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import Loading from '@/components/ui/Loading';

interface LevelFormData {
  name: string;
  xpReward: number;
  passingPercentage: number;
  topicId: string;
}

export default function LevelForm() {
  const { topicId, levelId } = useParams();
  const isEditing = !!levelId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LevelFormData>({
    defaultValues: {
      xpReward: 100,
      passingPercentage: 70,
      topicId: topicId
    }
  });

  useEffect(() => {
    if (isEditing) {
      loadLevel();
    }
  }, [levelId]);

  const loadLevel = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/levels/${levelId}`);
      const { name, xpReward, passingPercentage } = response.data;
      setValue('name', name);
      setValue('xpReward', xpReward);
      setValue('passingPercentage', passingPercentage);
    } catch (error) {
      toast({
        title: "Erro ao carregar nível",
        variant: "destructive"
      });
      navigate(`/dashboard/admin/topics/${topicId}/levels`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LevelFormData) => {
    try {
      setIsLoading(true);
      const payload = {
        ...data,
        xpReward: Number(data.xpReward),
        passingPercentage: Number(data.passingPercentage),
        topicId
      };

      if (isEditing) {
        await api.patch(`/levels/${levelId}`, payload);
        toast({ title: "Nível atualizado com sucesso!", variant: "success" });
      } else {
        await api.post('/levels', payload);
        toast({ title: "Nível criado com sucesso!", variant: "success" });
      }
      navigate(`/dashboard/admin/topics/${topicId}/levels`);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/dashboard/admin/topics/${topicId}/levels`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Nível' : 'Novo Nível'}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do Nível"
            placeholder="Ex: Iniciante, Avançado, Módulo 1"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={errors.name?.message}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="number"
              label="Recompensa de XP"
              placeholder="100"
              {...register('xpReward', {
                required: 'XP é obrigatório',
                min: { value: 0, message: 'Deve ser maior ou igual a 0' }
              })}
              error={errors.xpReward?.message}
              disabled={isLoading}
            />

            <Input
              type="number"
              label="Aprovação Mínima (%)"
              placeholder="70"
              {...register('passingPercentage', {
                required: 'Porcentagem é obrigatória',
                min: { value: 0, message: 'Mínimo 0' },
                max: { value: 100, message: 'Máximo 100' }
              })}
              error={errors.passingPercentage?.message}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading size="sm" /> : (isEditing ? 'Salvar Alterações' : 'Criar Nível')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
