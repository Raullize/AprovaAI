import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import Loading from '@/components/ui/Loading';

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionFormData {
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  levelId: string;
  explanation: string;
  options: Option[];
}

export default function QuestionForm() {
  const { levelId, questionId } = useParams();
  const isEditing = !!questionId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [topicId, setTopicId] = useState(''); // Para voltar

  const { register, control, handleSubmit, formState: { errors }, setValue } = useForm<QuestionFormData>({
    defaultValues: {
      type: 'MULTIPLE_CHOICE',
      levelId: levelId,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  // Monitorar qual opção é a correta para garantir apenas uma (visual check)
  // Na verdade, vamos usar um radio button separado visualmente que seta o isCorrect
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);

  useEffect(() => {
    // Carregar TopicId para o botão de voltar
    api.get(`/levels/${levelId}`).then(res => setTopicId(res.data.topicId));

    if (isEditing) {
      loadQuestion();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/questions/${questionId}`);
      const q = response.data;
      
      setValue('content', q.content);
      setValue('type', q.type);
      setValue('explanation', q.explanation || '');
      setValue('options', q.options);

      // Achar o índice da correta
      const correctIndex = q.options.findIndex((opt: Option) => opt.isCorrect);
      setCorrectOptionIndex(correctIndex >= 0 ? correctIndex : null);

    } catch (error) {
      toast({ title: "Erro ao carregar questão", variant: "destructive" });
      navigate(`/dashboard/admin/levels/${levelId}/questions`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: QuestionFormData) => {
    if (correctOptionIndex === null) {
      toast({ title: "Selecione uma alternativa correta", variant: "destructive" });
      return;
    }

    // Atualizar isCorrect baseado no índice selecionado
    const optionsWithCorrect = data.options.map((opt, index) => ({
      ...opt,
      isCorrect: index === correctOptionIndex
    }));

    const payload = { ...data, options: optionsWithCorrect };

    try {
      setIsLoading(true);
      if (isEditing) {
        await api.patch(`/questions/${questionId}`, payload);
        toast({ title: "Questão atualizada!", variant: "success" });
      } else {
        await api.post('/questions', payload);
        toast({ title: "Questão criada!", variant: "success" });
      }
      navigate(`/dashboard/admin/levels/${levelId}/questions`);
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Verifique os dados.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(`/dashboard/admin/levels/${levelId}/questions`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={!topicId}
        >
          <ArrowLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Questão' : 'Nova Questão'}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Enunciado</label>
              <textarea
                {...register('content', { required: 'Enunciado é obrigatório' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Digite a pergunta..."
              />
              {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="MULTIPLE_CHOICE">Múltipla Escolha</option>
                <option value="TRUE_FALSE">Verdadeiro ou Falso</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Explicação (Opcional)</label>
              <textarea
                {...register('explanation')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Explique por que a resposta está correta..."
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Alternativas</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '', isCorrect: false })}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOptionIndex === index}
                    onChange={() => setCorrectOptionIndex(index)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    title="Marcar como correta"
                  />
                  <div className="flex-1">
                    <Input
                      placeholder={`Alternativa ${index + 1}`}
                      {...register(`options.${index}.text` as const, { required: true })}
                      className="mb-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remover alternativa"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            {fields.length < 2 && (
              <p className="text-sm text-red-600 mt-2">Adicione pelo menos 2 alternativas.</p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading size="sm" /> : (isEditing ? 'Salvar Questão' : 'Criar Questão')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
