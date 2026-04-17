import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { examsService, type Exam } from '@/services/exams.service';
import { useToast } from '@/hooks/use-toast';
import { SearchInput } from '@/components/admin/shared/SearchInput';
import { DeleteConfirmModal } from '@/components/admin/shared/DeleteConfirmModal';
import { ExamCard } from '@/components/admin/exams/ExamCard';
import { ExamFormModal } from '@/components/admin/exams/ExamFormModal';

export default function AdminExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | undefined>(
    undefined,
  );
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadExams = useCallback(async () => {
    try {
      setIsLoading(true);
      setExams(await examsService.findAll());
    } catch {
      toast({ title: 'Erro ao carregar exames', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const filteredExams = useMemo(
    () =>
      exams.filter(
        (e) =>
          e?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e?.description &&
            e.description.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [exams, searchTerm],
  );

  const handleToggleStatus = async (exam: Exam) => {
    const newStatus = exam.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await examsService.update(exam.id, { status: newStatus });
      toast({
        title: 'Visibilidade alterada!',
        description: `O exame agora está ${newStatus === 'ACTIVE' ? 'público' : 'privado'}.`,
        variant: 'success',
      });
      loadExams();
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!examToDelete) return;
    await examsService.delete(examToDelete.id);
    toast({ title: 'Exame excluído com sucesso!', variant: 'success' });
    loadExams();
    setExamToDelete(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const newOrder = [...exams];
    const fromIdx = newOrder.findIndex((e) => e.id === draggedId);
    const toIdx = newOrder.findIndex((e) => e.id === targetId);
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setExams(newOrder);
    setDraggedId(null);
    try {
      await examsService.reorder(newOrder.map((e) => e.id));
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
      loadExams();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Exames</h1>
          <p className="text-gray-500 mt-1">
            Gerencie os exames disponíveis na plataforma.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingExamId(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-5 w-5 mr-2" /> Novo Exame
        </Button>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar exames..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchTerm ? 'Nenhum exame encontrado' : 'Nenhum exame cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos exames com "${searchTerm}".`
              : 'Comece criando o primeiro exame da plataforma.'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setEditingExamId(undefined);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-5 w-5 mr-2" /> Criar Primeiro Exame
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              isDragging={draggedId === exam.id}
              onDragStart={() => setDraggedId(exam.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(exam.id)}
              onEdit={(id) => {
                setEditingExamId(id);
                setIsModalOpen(true);
              }}
              onDelete={setExamToDelete}
              onToggleStatus={handleToggleStatus}
              onNavigate={(id) =>
                navigate(`/dashboard/admin/exams/${id}/topics`)
              }
            />
          ))}
        </div>
      )}

      <ExamFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadExams();
        }}
        examId={editingExamId}
      />

      {examToDelete && (
        <DeleteConfirmModal
          isOpen={!!examToDelete}
          onClose={() => setExamToDelete(null)}
          onConfirm={handleDelete}
          entityName={examToDelete.name}
          entityLabel="o exame"
        />
      )}
    </div>
  );
}
