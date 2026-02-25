import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import Loading from '@/components/ui/Loading';

interface ExamFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function ExamForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ExamFormData>({
    defaultValues: {
      status: 'ACTIVE'
    }
  });

  useEffect(() => {
    if (isEditing) {
      loadExam();
    }
  }, [id]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/exams/${id}`);
      const { name, description, status } = response.data;
      setValue('name', name);
      setValue('description', description || '');
      setValue('status', status);
    } catch (error) {
      toast({
        title: "Erro ao carregar exame",
        variant: "destructive"
      });
      navigate('/dashboard/admin/exams');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ExamFormData) => {
    try {
      setIsLoading(true);
      if (isEditing) {
        await api.patch(`/exams/${id}`, data);
        toast({ title: "Exame atualizado com sucesso!", variant: "success" });
      } else {
        await api.post('/exams', data);
        toast({ title: "Exame criado com sucesso!", variant: "success" });
      }
      navigate('/dashboard/admin/exams');
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
          onClick={() => navigate('/dashboard/admin/exams')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Exame' : 'Novo Exame'}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do Exame"
            placeholder="Ex: ENEM, FUVEST, OAB"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={errors.name?.message}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
              placeholder="Breve descrição sobre o exame..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              disabled={isLoading}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading size="sm" /> : (isEditing ? 'Salvar Alterações' : 'Criar Exame')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
