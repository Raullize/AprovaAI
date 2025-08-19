'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit, Trash2, Layers } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import TopicModal from '@/components/admin/TopicModal';

interface Exam {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
}

interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  examId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    levels: number;
  };
}

export default function ExamTopicsPageBySlug() {
  const params = useParams();
  const router = useRouter();
  const examSlug = params.slug as string;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  useEffect(() => {
    if (examSlug) {
      fetchExamAndTopics();
    }
  }, [examSlug]);

  const fetchExamAndTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/exams/by-slug/${examSlug}`);
      if (response.ok) {
        const data = await response.json();
        setExam({
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          status: data.status
        });
        setTopics(data.topics || []);
      } else if (response.status === 404) {
        router.push('/admin/exams');
      }
    } catch (error) {
      console.error('Erro ao carregar exame e tópicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Tem certeza que deseja excluir este tópico? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTopics(topics.filter(topic => topic.id !== topicId));
      }
    } catch (error) {
      console.error('Erro ao excluir tópico:', error);
    }
  };

  const handleTopicSaved = (savedTopic: Topic) => {
    if (editingTopic) {
      // Atualizar tópico existente
      setTopics(topics.map(topic => 
        topic.id === savedTopic.id ? savedTopic : topic
      ));
    } else {
      // Adicionar novo tópico
      setTopics([...topics, savedTopic]);
    }
  };

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Exame não encontrado</h1>
        <Button onClick={() => router.push('/admin/exams')}>Voltar para Exames</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <button
          onClick={() => router.push('/admin/exams')}
          className="hover:text-primary-600 transition-colors"
        >
          Exames
        </button>
        <span>></span>
        <span className="text-gray-900 font-medium">{exam.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/exams')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{exam.name}</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os tópicos deste exame
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Tópico
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar tópicos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum tópico encontrado' : 'Nenhum tópico cadastrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando o primeiro tópico para este exame'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Tópico
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Actions */}
              <div className="flex justify-end items-center gap-1 mb-4">
                <button
                  onClick={() => setEditingTopic(topic)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTopic(topic.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Topic Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {topic.name}
              </h3>
              {topic.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {topic.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{topic._count.levels} níveis</span>
                <span>
                  Criado em {new Date(topic.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Manage Levels Button */}
              <div className="pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    router.push(`/admin/exams/${exam.slug}/topics/${topic.slug}/levels`);
                  }}
                >
                  Gerenciar Níveis
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <TopicModal
        isOpen={showCreateModal || !!editingTopic}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTopic(null);
        }}
        onSave={handleTopicSaved}
        topic={editingTopic}
        examId={exam.id}
      />
    </div>
  );
}