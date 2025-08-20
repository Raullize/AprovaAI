'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit, Trash2, Target, Move } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import LevelModal from '@/components/admin/LevelModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Exam {
  id: string;
  name: string;
  slug: string;
}

interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  exam: Exam;
}

interface Level {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  topicId: string;
  xpReward: number;
  passingPercentage: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    questions: number;
  };
}

export default function TopicLevelsPageBySlug() {
  const params = useParams();
  const router = useRouter();
  const examSlug = params.slug as string;
  const topicSlug = params.topicSlug as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [draggedLevel, setDraggedLevel] = useState<Level | null>(null);

  useEffect(() => {
    if (examSlug && topicSlug) {
      fetchTopicAndLevels();
    }
  }, [examSlug, topicSlug]);

  const fetchTopicAndLevels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/topics/by-slug/${examSlug}/${topicSlug}`);
      if (response.ok) {
        const data = await response.json();
        setTopic({
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          exam: data.exam
        });
        setLevels(data.levels || []);
      } else if (response.status === 404) {
        router.push(`/admin/exams/${examSlug}/topics`);
      }
    } catch (error) {
      console.error('Erro ao carregar tópico e níveis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLevel = (level: Level) => {
    setLevelToDelete(level);
  };

  const confirmDeleteLevel = async () => {
    if (!levelToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/levels/${levelToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLevels(levels.filter(level => level.id !== levelToDelete.id));
        setLevelToDelete(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir nível');
      }
    } catch (error) {
      console.error('Erro ao excluir nível:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLevelSaved = (savedLevel: Level) => {
    if (editingLevel) {
      // Atualizar nível existente
      setLevels(levels.map(level => 
        level.id === savedLevel.id ? savedLevel : level
      ));
    } else {
      // Adicionar novo nível
      setLevels([...levels, savedLevel]);
    }
  };

  const handleReorderLevels = async (newOrder: Level[]) => {
    try {
      const response = await fetch('/api/admin/levels/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic?.id,
          levelIds: newOrder.map(l => l.id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLevels(data.levels);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao reordenar níveis');
      }
    } catch (error) {
      console.error('Erro ao reordenar níveis:', error);
      alert('Erro de conexão. Tente novamente.');
    }
  };

  const handleDragStart = (e: React.DragEvent, level: Level) => {
    setDraggedLevel(level);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetLevel: Level) => {
    e.preventDefault();
    
    if (!draggedLevel || draggedLevel.id === targetLevel.id) {
      setDraggedLevel(null);
      return;
    }

    const newLevels = [...levels];
    const draggedIndex = newLevels.findIndex(l => l.id === draggedLevel.id);
    const targetIndex = newLevels.findIndex(l => l.id === targetLevel.id);

    // Remove o item arrastado
    const [removed] = newLevels.splice(draggedIndex, 1);
    // Insere na nova posição
    newLevels.splice(targetIndex, 0, removed);

    setLevels(newLevels);
    handleReorderLevels(newLevels);
    setDraggedLevel(null);
  };

  const filteredLevels = levels.filter(level =>
    level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tópico não encontrado</h1>
        <Button onClick={() => router.push(`/admin/exams/${examSlug}/topics`)}>Voltar para Tópicos</Button>
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
        <button
          onClick={() => router.push(`/admin/exams/${topic.exam.slug}/topics`)}
          className="hover:text-primary-600 transition-colors"
        >
          {topic.exam.name}
        </button>
        <span>></span>
        <button
          onClick={() => router.push(`/admin/exams/${topic.exam.slug}/topics/${topic.slug}/levels`)}
          className="hover:text-primary-600 transition-colors"
        >
          {topic.name}
        </button>
        <span>></span>
        <span className="text-gray-900 font-medium">Níveis</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/exams/${examSlug}/topics`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Níveis</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os níveis de dificuldade deste tópico
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Nível
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar níveis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Levels Grid */}
      {filteredLevels.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum nível encontrado' : 'Nenhum nível cadastrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando o primeiro nível para este tópico'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Nível
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLevels.map((level, index) => (
            <div
              key={level.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                draggedLevel?.id === level.id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, level)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, level)}
            >
              {/* Actions */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-gray-400 cursor-move" />
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingLevel(level)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLevel(level)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Level Info */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {level.name}
                </h3>
              </div>
              
              {level.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {level.description}
                </p>
              )}

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">XP:</span>
                  <span className="font-medium text-green-600">{level.xpReward}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Aprovação:</span>
                  <span className="font-medium">{level.passingPercentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Questões:</span>
                  <span className="font-medium">{level._count?.questions || 0}</span>
                </div>
              </div>

              {/* Manage Questions Button */}
              <div className="pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    router.push(`/admin/exams/${topic.exam.slug}/topics/${topic.slug}/levels/${level.slug}/questions`);
                  }}
                >
                  Gerenciar Questões
                </Button>
              </div>

              {/* Creation Date */}
              <div className="text-xs text-gray-400 mt-2">
                Criado em {new Date(level.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <LevelModal
        isOpen={showCreateModal || !!editingLevel}
        onClose={() => {
          setShowCreateModal(false);
          setEditingLevel(null);
        }}
        onSave={handleLevelSaved}
        level={editingLevel}
        topicId={topic.id}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!levelToDelete}
        onClose={() => setLevelToDelete(null)}
        onConfirm={confirmDeleteLevel}
        title="Excluir Nível"
        message={`Tem certeza que deseja excluir o nível "${levelToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}