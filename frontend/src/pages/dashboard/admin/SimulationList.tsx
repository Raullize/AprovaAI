import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, BarChart, Search } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import { simulationsService, type Simulation } from '@/services/simulations.service';
import { topicsService } from '@/services/topics.service';
import { examsService } from '@/services/exams.service';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/admin/shared/PageHeader';
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
  const [editingSimulationId, setEditingSimulationId] = useState<string | undefined>(
    undefined,
  );
  const [simulationToDelete, setSimulationToDelete] = useState<Simulation | null>(null);
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
        prev.map((s) => (s.id === simulation.id ? { ...s, status: newStatus } : s)),
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
          <button
            onClick={() => {
              setEditingSimulationId(undefined);
              setIsModalOpen(true);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Novo Simulado
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
          placeholder="Buscar simulados..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm bg-white text-slate-800"
        />
      </div>

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
            {searchTerm ? 'Nenhum simulado encontrado' : 'Nenhum simulado cadastrado'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos nenhum simulado com o termo "${searchTerm}".`
              : 'Crie simulados de dificuldade para organizar as questões.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingSimulationId(undefined);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Criar Primeiro Simulado
            </button>
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
