'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit, Trash2, HelpCircle, Move } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import QuestionModal from '@/components/admin/QuestionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Level {
  id: string;
  name: string;
  slug: string;
  description?: string;
  topic: {
    id: string;
    name: string;
    slug: string;
    exam: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  questionId: string;
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: string;
  content: string;
  imageUrl?: string;
  explanation?: string;
  studyLink?: string;
  order: number;
  levelId: string;
  options: Option[];
  createdAt: string;
  updatedAt: string;
}

export default function LevelQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = params.id as string;
  
  const [level, setLevel] = useState<Level | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (levelId) {
      fetchLevelAndQuestions();
    }
  }, [levelId]);

  const fetchLevelAndQuestions = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do nível
      const levelResponse = await fetch(`/api/admin/levels/${levelId}`);
      if (levelResponse.ok) {
        const levelData = await levelResponse.json();
        setLevel(levelData);
      }
      
      // Buscar questões
      const questionsResponse = await fetch(`/api/admin/questions?levelId=${levelId}&limit=100`);
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData.questions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSaved = (savedQuestion: Question) => {
    if (editingQuestion) {
      // Atualizar questão existente
      setQuestions(prev => prev.map(q => q.id === savedQuestion.id ? savedQuestion : q));
    } else {
      // Adicionar nova questão
      setQuestions(prev => [...prev, savedQuestion]);
    }
    setEditingQuestion(null);
    setShowCreateModal(false);
  };

  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/questions/${questionToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
        setQuestionToDelete(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir questão');
      }
    } catch (error) {
      console.error('Erro ao excluir questão:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorderQuestions = async (newOrder: Question[]) => {
    try {
      const response = await fetch('/api/admin/questions/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelId,
          questionIds: newOrder.map(q => q.id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao reordenar questões');
      }
    } catch (error) {
      console.error('Erro ao reordenar questões:', error);
      alert('Erro de conexão. Tente novamente.');
    }
  };

  const handleDragStart = (e: React.DragEvent, question: Question) => {
    setDraggedQuestion(question);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetQuestion: Question) => {
    e.preventDefault();
    
    if (!draggedQuestion || draggedQuestion.id === targetQuestion.id) {
      setDraggedQuestion(null);
      return;
    }

    const newQuestions = [...questions];
    const draggedIndex = newQuestions.findIndex(q => q.id === draggedQuestion.id);
    const targetIndex = newQuestions.findIndex(q => q.id === targetQuestion.id);

    // Remove o item arrastado
    const [removed] = newQuestions.splice(draggedIndex, 1);
    // Insere na nova posição
    newQuestions.splice(targetIndex, 0, removed);

    setQuestions(newQuestions);
    handleReorderQuestions(newQuestions);
    setDraggedQuestion(null);
  };

  const filteredQuestions = questions.filter(question =>
    
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" />
      </div>
    );
  }

  if (!level) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nível não encontrado</h1>
        <Button onClick={() => router.back()}>Voltar</Button>
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
          onClick={() => router.push(`/admin/exams/${level.topic.exam.slug}/topics`)}
          className="hover:text-primary-600 transition-colors"
        >
          {level.topic.exam.name}
        </button>
        <span>></span>
        <button
          onClick={() => router.push(`/admin/exams/${level.topic.exam.slug}/topics/${level.topic.slug}/levels`)}
          className="hover:text-primary-600 transition-colors"
        >
          {level.topic.name}
        </button>
        <span>></span>
        <span className="text-gray-900 font-medium">{level.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {level.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie as questões deste simulado
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Questão
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar questões..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma questão encontrada' : 'Nenhuma questão cadastrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando a primeira questão para este nível'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Questão
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <div
              key={question.id}
              draggable
              onDragStart={(e) => handleDragStart(e, question)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, question)}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-move ${
                draggedQuestion?.id === question.id ? 'opacity-50' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Move className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {question.content.substring(0, 100)}...
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingQuestion(question)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-gray-700 mb-3">{question.content}</p>
                
                {/* Options */}
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 p-2 rounded border ${
                        option.isCorrect 
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        option.isCorrect 
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {option.isCorrect && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm">{option.text}</span>
                    </div>
                  )) || []}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {question.explanation && (
                    <span className="text-blue-600">✓ Com explicação</span>
                  )}
                  {question.studyLink && (
                    <span className="text-purple-600">✓ Com link de estudo</span>
                  )}
                </div>
                <span>
                  Criado em {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <QuestionModal
        isOpen={showCreateModal || !!editingQuestion}
        onClose={() => {
          setShowCreateModal(false);
          setEditingQuestion(null);
        }}
        onSave={handleQuestionSaved}
        question={editingQuestion}
        levelId={levelId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={confirmDeleteQuestion}
        title="Excluir Questão"
        message={`Tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}