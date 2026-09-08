import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Layers } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import { topicsService, type Topic } from '@/services/topics.service';
import { examsService } from '@/services/exams.service';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { DeleteConfirmModal } from '@/components/admin/shared/DeleteConfirmModal';
import { SearchInput } from '@/components/admin/shared/SearchInput';
import { TopicCard } from '@/components/admin/topics/TopicCard';
import { TopicFormModal } from '@/components/admin/topics/TopicFormModal';

export default function TopicList() {
  const { examId } = useParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [examName, setExamName] = useState('');
  const [resolvedExamId, setResolvedExamId] = useState<string>(examId ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | undefined>(
    undefined,
  );
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (examId) {
        const exam = await examsService.findOne(examId);
        setExamName(exam.name);
        setResolvedExamId(exam.id);
        setTopics(await topicsService.findAll(exam.id));
      }
    } catch {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
      navigate('/dashboard/exams');
    } finally {
      setIsLoading(false);
    }
  }, [examId, toast, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTopics = useMemo(
    () =>
      topics.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.description &&
            t.description.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [topics, searchTerm],
  );

  const handleToggleStatus = async (topic: Topic) => {
    const newStatus = topic.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await topicsService.update(topic.id, { status: newStatus });
      setTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? { ...t, status: newStatus } : t)),
      );
      toast({
        title: 'Visibilidade alterada!',
        description: `O status do tópico foi alterado para ${newStatus === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}.`,
        variant: 'success',
      });
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!topicToDelete) return;
    await topicsService.delete(topicToDelete.id);
    toast({ title: 'Tópico excluído com sucesso!', variant: 'success' });
    loadData();
    setTopicToDelete(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const newOrder = [...topics];
    const fromIdx = newOrder.findIndex((t) => t.id === draggedId);
    const toIdx = newOrder.findIndex((t) => t.id === targetId);
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setTopics(newOrder);
    setDraggedId(null);
    try {
      await topicsService.reorder(newOrder.map((t) => t.id));
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
      loadData();
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Tópicos"
        subtitle={`Gerencie os assuntos de ${examName}.`}
        breadcrumbItems={[
          { label: 'Exames', href: '/dashboard/exams' },
          { label: examName || 'Carregando...', href: '#' },
          { label: 'Tópicos' },
        ]}
        backHref="/dashboard/exams"
        action={
          <button
            onClick={() => {
              setEditingTopicId(undefined);
              setIsModalOpen(true);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Novo Tópico
          </button>
        }
      />

      {/* Search Input Section */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar tópicos..."
        size="lg"
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="bg-indigo-50 p-5 rounded-2xl mb-4">
            <Layers className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {searchTerm
              ? 'Nenhum tópico encontrado'
              : 'Nenhum tópico cadastrado'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos tópicos com "${searchTerm}".`
              : 'Comece criando o primeiro tópico para este exame.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingTopicId(undefined);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Criar Primeiro Tópico
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isDragging={draggedId === topic.id}
              onDragStart={() => setDraggedId(topic.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(topic.id)}
              onEdit={(id) => {
                setEditingTopicId(id);
                setIsModalOpen(true);
              }}
              onDelete={setTopicToDelete}
              onToggleStatus={handleToggleStatus}
              onNavigate={(id) =>
                navigate(`/dashboard/admin/topics/${id}/simulations`)
              }
            />
          ))}
        </div>
      )}

      <TopicFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadData();
        }}
        examId={resolvedExamId}
        topicId={editingTopicId}
      />

      {topicToDelete && (
        <DeleteConfirmModal
          isOpen={!!topicToDelete}
          onClose={() => setTopicToDelete(null)}
          onConfirm={handleDelete}
          entityName={topicToDelete.name}
          entityLabel="o tópico"
        />
      )}
    </div>
  );
}
