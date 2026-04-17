import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Layers } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { topicsService, type Topic } from '@/services/topics.service';
import { examsService } from '@/services/exams.service';
import { useToast } from '@/hooks/use-toast';
import { SearchInput } from '@/components/admin/shared/SearchInput';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { DeleteConfirmModal } from '@/components/admin/shared/DeleteConfirmModal';
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
    const newStatus = topic.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await topicsService.update(topic.id, { status: newStatus });
      setTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? { ...t, status: newStatus } : t)),
      );
      toast({
        title: `Tópico ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'}`,
        variant: 'success',
      });
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!topicToDelete) return;
    await topicsService.delete(topicToDelete.id);
    toast({ title: 'Tópico excluído', variant: 'success' });
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
    <div className="space-y-6">
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
          <Button
            onClick={() => {
              setEditingTopicId(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-5 w-5 mr-2" /> Novo Tópico
          </Button>
        }
      />

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar tópicos..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Layers className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchTerm
              ? 'Nenhum tópico encontrado'
              : 'Nenhum tópico cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos tópicos com "${searchTerm}".`
              : 'Comece criando o primeiro tópico para este exame.'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setEditingTopicId(undefined);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-5 w-5 mr-2" /> Criar Primeiro Tópico
            </Button>
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
                navigate(`/dashboard/admin/topics/${id}/levels`)
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
