import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, BarChart } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import {
  simulationsService,
  type Simulation,
} from '@/services/simulations.service';
import { topicsService } from '@/services/topics.service';
import { examsService } from '@/services/exams.service';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { SearchInput } from '@/components/admin/shared/SearchInput';
import { DeleteConfirmModal } from '@/components/admin/shared/DeleteConfirmModal';
import { SimulationCard } from '@/components/admin/simulations/SimulationCard';
import { SimulationFormModal } from '@/components/admin/simulations/SimulationFormModal';

export default function SimulationList() {
  const { topicId } = useParams();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [topicName, setTopicName] = useState('');
  const [topicColorScheme, setTopicColorScheme] = useState('indigo');
  const [topicIconKey, setTopicIconKey] = useState('target');
  const [examName, setExamName] = useState('');
  const [examId, setExamId] = useState('');
  const [resolvedTopicId, setResolvedTopicId] = useState<string>(topicId ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSimulationId, setEditingSimulationId] = useState<
    string | undefined
  >(undefined);
  const [simulationToDelete, setSimulationToDelete] =
    useState<Simulation | null>(null);
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
        setSimulations(await simulationsService.findAll(topic.id));
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

  const filteredSimulations = useMemo(
    () =>
      simulations.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [simulations, searchTerm],
  );

  const handleToggleStatus = async (simulation: Simulation) => {
    const newStatus = simulation.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await simulationsService.update(simulation.id, { status: newStatus });
      setSimulations((prev) =>
        prev.map((s) =>
          s.id === simulation.id ? { ...s, status: newStatus } : s,
        ),
      );
      toast({
        title: 'Visibilidade alterada!',
        description: `O status do simulado foi alterado para ${newStatus === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}.`,
        variant: 'success',
      });
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!simulationToDelete) return;
    await simulationsService.delete(simulationToDelete.id);
    toast({ title: 'Simulado excluído', variant: 'success' });
    loadData();
    setSimulationToDelete(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const newOrder = [...simulations];
    const fromIdx = newOrder.findIndex((s) => s.id === draggedId);
    const toIdx = newOrder.findIndex((s) => s.id === targetId);
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setSimulations(newOrder);
    setDraggedId(null);
    try {
      await simulationsService.reorder(newOrder.map((s) => s.id));
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
      loadData();
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Simulados"
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
          { label: 'Simulados' },
        ]}
        backHref={
          examId
            ? `/dashboard/admin/exams/${examId}/topics`
            : '/dashboard/exams'
        }
        action={
          <Button
            variant="gamified"
            onClick={() => {
              setEditingSimulationId(undefined);
              setIsModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/20 gap-2 active:border-b-0 active:translate-y-1"
          >
            <Plus className="h-5 w-5" /> Novo Simulado
          </Button>
        }
      />

      {/* Search Input Section */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar simulados..."
        size="lg"
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : filteredSimulations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="bg-indigo-50 p-5 rounded-2xl mb-4">
            <BarChart className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {searchTerm
              ? 'Nenhum simulado encontrado'
              : 'Nenhum simulado cadastrado'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos nenhum simulado com o termo "${searchTerm}".`
              : 'Crie simulados de dificuldade para organizar as questões.'}
          </p>
          {!searchTerm && (
            <Button
              variant="gamified"
              onClick={() => {
                setEditingSimulationId(undefined);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm gap-2 active:border-b-0 active:translate-y-0.5"
            >
              <Plus className="h-5 w-5" /> Criar Primeiro Simulado
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSimulations.map((simulation) => (
            <SimulationCard
              key={simulation.id}
              simulation={simulation}
              colorScheme={topicColorScheme}
              iconKey={topicIconKey}
              isDragging={draggedId === simulation.id}
              onDragStart={() => setDraggedId(simulation.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(simulation.id)}
              onEdit={(id) => {
                setEditingSimulationId(id);
                setIsModalOpen(true);
              }}
              onDelete={setSimulationToDelete}
              onToggleStatus={handleToggleStatus}
              onNavigate={(id) =>
                navigate(`/dashboard/admin/simulations/${id}/questions`)
              }
            />
          ))}
        </div>
      )}

      <SimulationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadData();
        }}
        topicId={resolvedTopicId}
        simulationId={editingSimulationId}
      />

      {simulationToDelete && (
        <DeleteConfirmModal
          isOpen={!!simulationToDelete}
          onClose={() => setSimulationToDelete(null)}
          onConfirm={handleDelete}
          entityName={simulationToDelete.name}
          entityLabel="o simulado"
        />
      )}
    </div>
  );
}
