import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, HelpCircle } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { questionsService, type Question } from '@/services/questions.service';
import { simulationsService } from '@/services/simulations.service';
import { topicsService } from '@/services/topics.service';
import { examsService } from '@/services/exams.service';
import { uploadService } from '@/services/upload.service';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { DeleteConfirmModal } from '@/components/admin/shared/DeleteConfirmModal';
import { SearchInput } from '@/components/admin/shared/SearchInput';
import { QuestionCard } from '@/components/admin/questions/QuestionCard';
import { QuestionFormModal } from '@/components/admin/questions/QuestionFormModal';

interface BreadcrumbData {
  examId: string;
  examName: string;
  topicId: string;
  topicName: string;
  simulationName: string;
}

export default function QuestionList() {
  const { simulationId: simulationIdParam } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [simulationId, setSimulationId] = useState<string>(
    simulationIdParam ?? '',
  );
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData>({
    examId: '',
    examName: '',
    topicId: '',
    topicName: '',
    simulationName: '',
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
      if (simulationIdParam) {
        const level = await simulationsService.findOne(simulationIdParam);
        setSimulationId(level.id);
        const topic = await topicsService.findOne(level.topicId);
        const exam = await examsService.findOne(topic.examId);
        setBreadcrumb({
          examId: exam.id,
          examName: exam.name,
          topicId: topic.id,
          topicName: topic.name,
          simulationName: level.name,
        });
        setQuestions(await questionsService.findAll(level.id));
      }
    } catch {
      toast({ title: 'Erro ao carregar questões', variant: 'destructive' });
      navigate('/dashboard/exams');
    } finally {
      setIsLoading(false);
    }
  }, [simulationIdParam, toast, navigate]);

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
    const newStatus = q.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await questionsService.update(q.id, { status: newStatus });
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, status: newStatus } : item,
        ),
      );
      toast({
        title: 'Visibilidade alterada!',
        description: `O status da questão foi alterado para ${newStatus === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}.`,
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
        subtitle={`Simulado: ${breadcrumb.simulationName}${!isLoading ? ` (${questions.length} quest${questions.length !== 1 ? 'ões' : 'ão'})` : ''}`}
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
              ? `/dashboard/admin/topics/${breadcrumb.topicId}/simulations`
              : '#',
          },
          { label: breadcrumb.simulationName || 'Carregando...', href: '#' },
          { label: 'Questões' },
        ]}
        backHref={
          breadcrumb.topicId
            ? `/dashboard/admin/topics/${breadcrumb.topicId}/simulations`
            : '/dashboard/exams'
        }
        action={
          <Button
            variant="gamified"
            onClick={() => {
              setEditingQuestion(null);
              setIsFormOpen(true);
            }}
            className="px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/20 gap-2 active:border-b-0 active:translate-y-1"
          >
            <Plus className="h-5 w-5" /> Nova Questão
          </Button>
        }
      />

      {/* Search Input Section */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar questões por conteúdo ou alternativa..."
        size="lg"
      />

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
              : 'Crie questões para este simulado e comece a avaliar o conhecimento dos alunos.'}
          </p>
          {!searchTerm && (
            <Button
              variant="gamified"
              onClick={() => {
                setEditingQuestion(null);
                setIsFormOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm gap-2 active:border-b-0 active:translate-y-0.5"
            >
              <Plus className="h-5 w-5" /> Criar Primeira Questão
            </Button>
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
        simulationId={simulationId}
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
