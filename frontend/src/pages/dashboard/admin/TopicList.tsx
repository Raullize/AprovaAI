import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronRight, Layers } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Breadcrumb from '@/components/ui/Breadcrumb';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  _count?: {
    levels: number;
  };
}

export default function TopicList() {
  const { examId } = useParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [examName, setExamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [examId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [examRes, topicsRes] = await Promise.all([
        api.get(`/exams/${examId}`),
        api.get(`/topics?examId=${examId}`)
      ]);
      setExamName(examRes.data.name);
      setTopics(topicsRes.data);
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
    if (!confirm('Tem certeza que deseja excluir este tópico?')) return;
    try {
      await api.delete(`/topics/${id}`);
      toast({ title: "Tópico excluído", variant: "success" });
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
              { label: examName || 'Carregando...', href: '#' },
              { label: 'Tópicos' }
            ]} 
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tópicos</h1>
            <p className="text-gray-500 mt-1">Gerencie os assuntos de {examName}.</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/dashboard/admin/exams/${examId}/topics/new`)}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Tópico
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : topics.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum tópico encontrado</h3>
          <p className="text-gray-500 mt-2">Adicione tópicos para estruturar este exame.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Níveis</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.map((topic) => (
                <tr key={topic.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{topic.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      topic.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {topic.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic._count?.levels || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => navigate(`/dashboard/admin/topics/${topic.id}/levels`)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Gerenciar Níveis"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/admin/exams/${examId}/topics/${topic.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
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
