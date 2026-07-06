import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, HelpCircle, Search } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import { questionsService, type Question } from '@/services/questions.service';
import { levelsService } from '@/services/levels.service';
import { topicsService } from '@/services/topics.service';
import { examsService } from '@/services/exams.service';
import { uploadService } from '@/services/upload.service';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { DeleteConfirmModal } from '@/components/admin/shared/DeleteConfirmModal';
import { QuestionCard } from '@/components/admin/questions/QuestionCard';
import { QuestionFormModal } from '@/components/admin/questions/QuestionFormModal';

interface BreadcrumbData {
  examId: string;
  examName: string;
  topicId: string;
  topicName: string;
  levelName: string;
}

export default function QuestionList() {
  const { levelId: levelIdParam } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [levelId, setLevelId] = useState<string>(levelIdParam ?? '');
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData>({
    examId: '',
    examName: '',
    topicId: '',
    topicName: '',
    levelName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null,
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (levelIdParam) {
        const level = await levelsService.findOne(levelIdParam);
        setLevelId(level.id);
        const topic = await topicsService.findOne(level.topicId);
        const exam = await examsService.findOne(topic.examId);
        setBreadcrumb({
          examId: exam.id,
          examName: exam.name,
          topicId: topic.id,
          topicName: topic.name,
          levelName: level.name,
        });
        setQuestions(await questionsService.findAll(level.id));
      }
    } catch {
      toast({ title: 'Erro ao carregar questões', variant: 'destructive' });
      navigate('/dashboard/exams');
    } finally {
      setIsLoading(false);
    }
  }, [levelIdParam, toast, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredQuestions = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.options.some((o) =>
            o.text.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      ),
    [questions, searchTerm],
  );

  const handleToggleStatus = async (q: Question) => {
    const newStatus = q.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await questionsService.update(q.id, { status: newStatus });
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, status: newStatus } : item,
        ),
      );
      toast({
        title: 'Visibilidade alterada!',
        description: `A questão agora está ${newStatus === 'ACTIVE' ? 'pública' : 'privada'}.`,
        variant: 'success',
      });
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    if (questionToDelete.imageUrl?.startsWith('/uploads/')) {
      const filename = questionToDelete.imageUrl.split('/').pop();
      if (filename) {
        try {
          await uploadService.deleteFile(filename);
        } catch {
          /* ignore */
        }
      }
    }
    await questionsService.delete(questionToDelete.id);
    toast({ title: 'Questão excluída', variant: 'success' });
    setQuestionToDelete(null);
    loadData();
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const newOrder = [...questions];
    const fromIdx = newOrder.findIndex((q) => q.id === draggedId);
    const toIdx = newOrder.findIndex((q) => q.id === targetId);
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setQuestions(newOrder);
    setDraggedId(null);
    try {
      await questionsService.reorder(newOrder.map((q) => q.id));
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
      loadData();
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Questões"
        subtitle={`Nível: ${breadcrumb.levelName}${!isLoading ? ` (${questions.length} quest${questions.length !== 1 ? 'ões' : 'ão'})` : ''}`}
        breadcrumbItems={[
          { label: 'Exames', href: '/dashboard/exams' },
          {
            label: breadcrumb.examName || 'Carregando...',
            href: breadcrumb.examId
              ? `/dashboard/admin/exams/${breadcrumb.examId}/topics`
              : '#',
          },
          {
            label: breadcrumb.topicName || 'Carregando...',
            href: breadcrumb.topicId
              ? `/dashboard/admin/topics/${breadcrumb.topicId}/levels`
              : '#',
          },
          { label: breadcrumb.levelName || 'Carregando...', href: '#' },
          { label: 'Questões' },
        ]}
        backHref={
          breadcrumb.topicId
            ? `/dashboard/admin/topics/${breadcrumb.topicId}/levels`
            : '/dashboard/exams'
        }
        action={
          <button
            onClick={() => {
              setEditingQuestion(null);
              setIsFormOpen(true);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Nova Questão
          </button>
        }
      />

      {/* Search Input Section */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar questões por conteúdo ou alternativa..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm bg-white text-slate-800"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loading size="lg" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="bg-indigo-50 p-5 rounded-2xl mb-4">
            <HelpCircle className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {searchTerm
              ? 'Nenhuma questão encontrada'
              : 'Nenhuma questão cadastrada'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos questões com "${searchTerm}".`
              : 'Crie questões para este nível e comece a avaliar o conhecimento dos alunos.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingQuestion(null);
                setIsFormOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Criar Primeira Questão
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              isDragging={draggedId === q.id}
              onDragStart={() => setDraggedId(q.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(q.id)}
              onEdit={(q) => {
                setEditingQuestion(q);
                setIsFormOpen(true);
              }}
              onDelete={setQuestionToDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      <QuestionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          loadData();
        }}
        levelId={levelId}
        question={editingQuestion}
      />

      {questionToDelete && (
        <DeleteConfirmModal
          isOpen={!!questionToDelete}
          onClose={() => setQuestionToDelete(null)}
          onConfirm={handleDelete}
          entityName={questionToDelete.content.slice(0, 60) + '...'}
          entityLabel="a questão"
        />
      )}
    </div>
  );
}
