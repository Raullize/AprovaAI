'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Move, BookOpen, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import QuestionModal from '@/components/admin/QuestionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Exam, Topic, Level, Option, Question } from '@/types';

import { getLevelBySlug } from '@/actions/levels';
import { deleteQuestion, reorderQuestions } from '@/actions/questions';

export default function LevelQuestionsPageBySlug() {
  const params = useParams();
  const router = useRouter();
  const examSlug = params.slug as string;
  const topicSlug = params.topicSlug as string;
  const levelSlug = params.levelSlug as string;
  
  const [level, setLevel] = useState<Level | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (examSlug && topicSlug && levelSlug) {
      fetchLevelAndQuestions();
    }
  }, [examSlug, topicSlug, levelSlug]);

  const fetchLevelAndQuestions = async () => {
    try {
      setLoading(true);
      const data = await getLevelBySlug(examSlug, topicSlug, levelSlug);
      setLevel({
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        order: data.order || 0,
        topicId: data.topicId,
        simuladoName: data.simuladoName,
        simuladoDescription: data.simuladoDescription,
        xpReward: data.xpReward || 0,
        passingPercentage: data.passingPercentage || 70,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        topic: data.topic
      });
      setQuestions(data.questions || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar nível e questões:', error);
      if (error instanceof Error && error.message === 'Nível não encontrado') {
        router.push(`/admin/exams/${examSlug}/topics/${topicSlug}/levels`);
      }
      setLoading(false);
    }
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
      await deleteQuestion(questionToDelete.id);
      setQuestions(questions.filter(question => question.id !== questionToDelete.id));
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir questão:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir questão');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuestionSaved = (savedQuestion: Question) => {
    // Atualização otimista/local
    if (editingQuestion) {
      setQuestions(questions.map(question => 
        question.id === savedQuestion.id ? savedQuestion : question
      ));
    } else {
      setQuestions([...questions, savedQuestion]);
    }
  };

  const handleReorderQuestions = async (newOrder: Question[]) => {
    if (!level) return;
    try {
      await reorderQuestions(level.id, newOrder.map(q => q.id));
      // Estado já atualizado otimisticamente no handleDrop
    } catch (error) {
      console.error('Erro ao reordenar questões:', error);
      alert('Erro ao salvar nova ordem. Tente novamente.');
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

    const [removed] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, removed);

    setQuestions(newQuestions);
    handleReorderQuestions(newQuestions);
    setDraggedQuestion(null);
  };

  const filteredQuestions = questions.filter(question =>
    question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.explanation?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Button onClick={() => router.push(`/admin/exams/${examSlug}/topics/${topicSlug}/levels`)}>Voltar para Níveis</Button>
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
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => router.push(`/admin/exams/${level.topic?.exam?.slug}/topics`)}
          className="hover:text-primary-600 transition-colors"
        >
          {level.topic?.exam?.name}
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => router.push(`/admin/exams/${level.topic?.exam?.slug}/topics/${level.topic?.slug}/levels`)}
          className="hover:text-primary-600 transition-colors"
        >
          {level.topic?.name}
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => router.push(`/admin/exams/${level.topic?.exam?.slug}/topics/${level.topic?.slug}/levels`)}
          className="hover:text-primary-600 transition-colors"
        >
          {level.name}
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-medium">Questões</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Questões</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as questões do {level.name}
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
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                draggedQuestion?.id === question.id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, question)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, question)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Move className="h-4 w-4 text-gray-400 cursor-move" />
                  <div>
                    <span className="text-xs text-gray-500">Questão #{index + 1}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        question.type === 'SINGLE_CHOICE'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {question.type === 'SINGLE_CHOICE' ? 'Única Escolha' : 'Múltipla Escolha'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {question.options?.filter(option => option.isCorrect).length || 0} resposta(s) correta(s)
                      </span>
                    </div>
                  </div>
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

              {/* Question Text */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {question.content}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {question.options?.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      option.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      option.isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {option.isCorrect && (
                      <span className="text-green-600 text-sm font-medium">✓ Correta</span>
                    )}
                  </div>
                )) || []}
              </div>

              {/* Explanation and Study Link */}
              {(question.explanation || question.studyLink) && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  {question.explanation && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Explicação:</span>
                      <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
                    </div>
                  )}
                  {question.studyLink && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Link de estudo:</span>
                      <a
                        href={question.studyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 ml-2"
                      >
                        {question.studyLink}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Creation Date */}
              <div className="text-xs text-gray-400 mt-3">
                Criada em {new Date(question.createdAt).toLocaleDateString('pt-BR')}
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
        levelId={level.id}
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