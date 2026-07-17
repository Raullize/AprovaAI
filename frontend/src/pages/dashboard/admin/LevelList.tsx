import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, BarChart, Search } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import { levelsService, type Level } from '@/services/levels.service';
import { topicsService } from '@/services/topics.service';
import { examsService } from '@/services/exams.service';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { DeleteConfirmModal } from '@/components/admin/shared/DeleteConfirmModal';
import { LevelCard } from '@/components/admin/levels/LevelCard';
import { LevelFormModal } from '@/components/admin/levels/LevelFormModal';

export default function LevelList() {
  const { topicId } = useParams();
  const [levels, setLevels] = useState<Level[]>([]);
  const [topicName, setTopicName] = useState('');
  const [topicColorScheme, setTopicColorScheme] = useState('indigo');
  const [topicIconKey, setTopicIconKey] = useState('target');
  const [examName, setExamName] = useState('');
  const [examId, setExamId] = useState('');
  const [resolvedTopicId, setResolvedTopicId] = useState<string>(topicId ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevelId, setEditingLevelId] = useState<string | undefined>(
    undefined,
  );
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (topicId) {
        const topic = await topicsService.findOne(topicId);
        setTopicName(topic.name);
        setTopicColorScheme(topic.colorScheme || 'indigo');
        setTopicIconKey(topic.iconKey || 'target');
        setResolvedTopicId(topic.id);
        const exam = await examsService.findOne(topic.examId);
        setExamName(exam.name);
        setExamId(exam.id);
        setLevels(await levelsService.findAll(topic.id));
      }
    } catch {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
      navigate('/dashboard/exams');
    } finally {
      setIsLoading(false);
    }
  }, [topicId, toast, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLevels = useMemo(
    () =>
      levels.filter((l) =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [levels, searchTerm],
  );

  const handleToggleStatus = async (level: Level) => {
    const newStatus = level.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await levelsService.update(level.id, { status: newStatus });
      setLevels((prev) =>
        prev.map((l) => (l.id === level.id ? { ...l, status: newStatus } : l)),
      );
      toast({
        title: 'Visibilidade alterada!',
        description: `O status do nível foi alterado para ${newStatus === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}.`,
        variant: 'success',
      });
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!levelToDelete) return;
    await levelsService.delete(levelToDelete.id);
    toast({ title: 'Nível excluído', variant: 'success' });
    loadData();
    setLevelToDelete(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const newOrder = [...levels];
    const fromIdx = newOrder.findIndex((l) => l.id === draggedId);
    const toIdx = newOrder.findIndex((l) => l.id === targetId);
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setLevels(newOrder);
    setDraggedId(null);
    try {
      await levelsService.reorder(newOrder.map((l) => l.id));
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
      loadData();
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Níveis"
        subtitle={`Dificuldades para o tópico ${topicName}.`}
        breadcrumbItems={[
          { label: 'Exames', href: '/dashboard/exams' },
          {
            label: examName || '...',
            href: examId ? `/dashboard/admin/exams/${examId}/topics` : '#',
          },
          {
            label: 'Tópicos',
            href: examId ? `/dashboard/admin/exams/${examId}/topics` : '#',
          },
          { label: topicName || '...', href: '#' },
          { label: 'Níveis' },
        ]}
        backHref={
          examId
            ? `/dashboard/admin/exams/${examId}/topics`
            : '/dashboard/exams'
        }
        action={
          <button
            onClick={() => {
              setEditingLevelId(undefined);
              setIsModalOpen(true);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Novo Nível
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
          placeholder="Buscar níveis..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm bg-white text-slate-800"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : filteredLevels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="bg-indigo-50 p-5 rounded-2xl mb-4">
            <BarChart className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {searchTerm ? 'Nenhum nível encontrado' : 'Nenhum nível cadastrado'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos nenhum nível com o termo "${searchTerm}".`
              : 'Crie níveis de dificuldade para organizar as questões.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingLevelId(undefined);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Criar Primeiro Nível
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLevels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              colorScheme={topicColorScheme}
              iconKey={topicIconKey}
              isDragging={draggedId === level.id}
              onDragStart={() => setDraggedId(level.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(level.id)}
              onEdit={(id) => {
                setEditingLevelId(id);
                setIsModalOpen(true);
              }}
              onDelete={setLevelToDelete}
              onToggleStatus={handleToggleStatus}
              onNavigate={(id) =>
                navigate(`/dashboard/admin/levels/${id}/questions`)
              }
            />
          ))}
        </div>
      )}

      <LevelFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadData();
        }}
        topicId={resolvedTopicId}
        levelId={editingLevelId}
      />

      {levelToDelete && (
        <DeleteConfirmModal
          isOpen={!!levelToDelete}
          onClose={() => setLevelToDelete(null)}
          onConfirm={handleDelete}
          entityName={levelToDelete.name}
          entityLabel="o nível"
        />
      )}
    </div>
  );
}
