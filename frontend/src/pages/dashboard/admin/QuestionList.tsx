import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileQuestion } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Breadcrumb from '@/components/ui/Breadcrumb';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  _count?: {
    options: number;
  };
}

export default function QuestionList() {
  const { levelId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [levelName, setLevelName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [examName, setExamName] = useState('');
  const [topicId, setTopicId] = useState('');
  const [examId, setExamId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [levelId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Carregar nível para pegar topicId
      const levelRes = await api.get(`/levels/${levelId}`);
      const level = levelRes.data;
      setLevelName(level.name);
      setTopicId(level.topicId);

      // Carregar tópico para pegar examId e nome
      const topicRes = await api.get(`/topics/${level.topicId}`);
      const topic = topicRes.data;
      setTopicName(topic.name);
      setExamId(topic.examId);

      // Carregar exame para nome
      const examRes = await api.get(`/exams/${topic.examId}`);
      setExamName(examRes.data.name);

      // Carregar questões
      const questionsRes = await api.get(`/questions?levelId=${levelId}`);
      setQuestions(questionsRes.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        variant: "destructive"
      });
      navigate('/dashboard/exams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast({ title: "Questão excluída", variant: "success" });
      loadData();
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-4"> {/* Aumentado espaçamento vertical aqui */}
          <Breadcrumb 
            items={[
              { label: 'Exames', href: '/dashboard/exams' },
              { label: examName || '...', href: `/dashboard/admin/exams/${examId}/topics` },
              { label: 'Tópicos', href: `/dashboard/admin/exams/${examId}/topics` },
              { label: topicName || '...', href: `/dashboard/admin/topics/${topicId}/levels` },
              { label: 'Níveis', href: `/dashboard/admin/topics/${topicId}/levels` },
              { label: levelName || '...', href: '#' },
              { label: 'Questões' }
            ]} 
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Questões</h1>
            <p className="text-gray-500 mt-1">Gerencie as perguntas de {levelName}.</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/dashboard/admin/levels/${levelId}/questions/new`)}>
          <Plus className="h-5 w-5 mr-2" />
          Nova Questão
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma questão encontrada</h3>
          <p className="text-gray-500 mt-2">Adicione perguntas para compor este nível.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enunciado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">{question.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {question.type === 'MULTIPLE_CHOICE' ? 'Múltipla Escolha' : 'V/F'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => navigate(`/dashboard/admin/levels/${levelId}/questions/${question.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
