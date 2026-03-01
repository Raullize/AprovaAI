import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useToast } from '../../../hooks/use-toast';
import api from '../../../services/api';
import Loading from '../../../components/ui/Loading';

interface SimulationFormData {
  title: string;
  description: string;
  examId: string;
  topics: string[];
  questionCount: number;
  timeLimit: number; // em minutos
}

interface Exam {
  id: string;
  title: string;
  year: number;
}

export default function CreateSimulation() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingExams, setLoadingExams] = useState(true);
  const { register, handleSubmit, formState: { errors } } = useForm<SimulationFormData>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/exams');
        setExams(response.data);
      } catch (error) {
        console.error('Erro ao buscar exames', error);
        setExams([
          { id: '1', title: 'ENEM 2023', year: 2023 },
          { id: '2', title: 'ENEM 2022', year: 2022 },
          { id: '3', title: 'FUVEST 2023', year: 2023 },
        ]);
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  const onSubmit = async (data: SimulationFormData) => {
    setIsLoading(true);
    try {
      console.log('Criando simulado:', data);
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Simulado criado com sucesso!",
        description: "Você será redirecionado para iniciar a prova.",
        variant: "success"
      });

      navigate('/dashboard/simulations');
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao criar simulado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Novo Simulado</h1>
        <p className="text-gray-500 mt-1">Configure seu simulado personalizado para treinar.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <Input
                label="Título do Simulado"
                placeholder="Ex: Treino de Matemática - Semana 1"
                {...register('title', { required: 'Título é obrigatório' })}
                error={errors.title?.message}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exame Base
              </label>
              <select
                {...register('examId', { required: 'Selecione um exame base' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                disabled={loadingExams}
              >
                <option value="">Selecione um exame...</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.year})
                  </option>
                ))}
              </select>
              {errors.examId && (
                <p className="text-sm text-red-600 mt-1">{errors.examId.message}</p>
              )}
            </div>

            <div>
              <Input
                type="number"
                label="Quantidade de Questões"
                placeholder="Ex: 30"
                min={5}
                max={90}
                {...register('questionCount', {
                  required: 'Defina a quantidade',
                  min: { value: 5, message: 'Mínimo de 5 questões' },
                  max: { value: 90, message: 'Máximo de 90 questões' }
                })}
                error={errors.questionCount?.message}
              />
            </div>

            <div>
              <Input
                type="number"
                label="Tempo Limite (minutos)"
                placeholder="Ex: 120"
                {...register('timeLimit', { required: 'Defina o tempo limite' })}
                error={errors.timeLimit?.message}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? <Loading size="sm" /> : 'Criar Simulado'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
