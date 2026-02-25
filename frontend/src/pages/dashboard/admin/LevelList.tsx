import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart, ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Breadcrumb from '@/components/ui/Breadcrumb';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Level {
  id: string;
  name: string;
  xpReward: number;
  passingPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  _count?: {
    questions: number;
  };
}

export default function LevelList() {
  const { topicId } = useParams();
  const [levels, setLevels] = useState<Level[]>([]);
  const [topicName, setTopicName] = useState('');
  const [examName, setExamName] = useState(''); // Novo estado para o breadcrumb
  const [examId, setExamId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [topicId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Carregar tópico para pegar examId
      const topicRes = await api.get(`/topics/${topicId}`);
      const topic = topicRes.data;
      setTopicName(topic.name);
      setExamId(topic.examId);

      // Carregar exame para o breadcrumb
      const examRes = await api.get(`/exams/${topic.examId}`);
      setExamName(examRes.data.name);

      // Carregar níveis
      const levelsRes = await api.get(`/levels?topicId=${topicId}`);
      setLevels(levelsRes.data);
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
    if (!confirm('Tem certeza que deseja excluir este nível?')) return;
    try {
      await api.delete(`/levels/${id}`);
      toast({ title: "Nível excluído", variant: "success" });
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
              { label: topicName || '...', href: '#' },
              { label: 'Níveis' }
            ]} 
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Níveis</h1>
            <p className="text-gray-500 mt-1">Dificuldades para o tópico {topicName}.</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/dashboard/admin/topics/${topicId}/levels/new`)}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Nível
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : levels.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum nível encontrado</h3>
          <p className="text-gray-500 mt-2">Crie níveis de dificuldade para organizar as questões.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aprovação Min.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questões</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {levels.map((level) => (
                <tr key={level.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{level.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {level.xpReward} XP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {level.passingPercentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {level._count?.questions || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => navigate(`/dashboard/admin/levels/${level.id}/questions`)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Gerenciar Questões"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/admin/topics/${topicId}/levels/${level.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(level.id)}
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
