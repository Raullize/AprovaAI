import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import Loading from '@/components/ui/Loading';

interface TopicFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  examId: string;
}

export default function TopicForm() {
  const { examId, topicId } = useParams();
  const isEditing = !!topicId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<TopicFormData>({
    defaultValues: {
      status: 'ACTIVE',
      examId: examId
    }
  });

  const statusValue = watch('status');

  useEffect(() => {
    if (isEditing) {
      loadTopic();
    }
  }, [topicId]);

  const loadTopic = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/topics/${topicId}`);
      const { name, description, status } = response.data;
      setValue('name', name);
      setValue('description', description || '');
      setValue('status', status);
    } catch (error) {
      toast({
        title: "Erro ao carregar tópico",
        variant: "destructive"
      });
      navigate(`/dashboard/admin/exams/${examId}/topics`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TopicFormData) => {
    try {
      setIsLoading(true);
      if (isEditing) {
        await api.patch(`/topics/${topicId}`, data);
        toast({ title: "Tópico atualizado com sucesso!", variant: "success" });
      } else {
        await api.post('/topics', { ...data, examId });
        toast({ title: "Tópico criado com sucesso!", variant: "success" });
      }
      navigate(`/dashboard/admin/exams/${examId}/topics`);
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
          onClick={() => navigate(`/dashboard/admin/exams/${examId}/topics`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Tópico' : 'Novo Tópico'}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome do Tópico"
            placeholder="Ex: Matemática Básica, Direito Civil"
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
              placeholder="Breve descrição sobre o tópico..."
              disabled={isLoading}
            />
          </div>

          {/* Status toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-700">Status do Tópico</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {statusValue === 'ACTIVE' ? 'Ativo — visível para os alunos' : 'Inativo — oculto para os alunos'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setValue('status', statusValue === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', { shouldDirty: true })}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${statusValue === 'ACTIVE' ? 'bg-primary-600' : 'bg-gray-300'
                }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${statusValue === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
            <input type="hidden" {...register('status')} />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading size="sm" /> : (isEditing ? 'Salvar Alterações' : 'Criar Tópico')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
