import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Search, ChevronDown } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import { examsService, type Exam } from '@/services/exams.service';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { DeleteConfirmModal } from '@/components/admin/shared/DeleteConfirmModal';
import { ExamCard } from '@/components/admin/exams/ExamCard';
import { ExamFormModal } from '@/components/admin/exams/ExamFormModal';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'Todos', label: 'Todas as Categorias' },
  { key: 'CONCURSOS', label: 'Concursos' },
  { key: 'CERTIFICACOES', label: 'Certificações' },
  { key: 'VESTIBULAR', label: 'Vestibular' },
  { key: 'OAB', label: 'OAB' },
  { key: 'OUTROS', label: 'Outros' },
];

export default function AdminExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchesCategory =
        activeCategory === 'Todos' || e.category === activeCategory;
      const matchesSearch =
        e?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e?.description &&
          e.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [exams, searchTerm, activeCategory]);

  const handleToggleStatus = async (exam: Exam) => {
    const newStatus = exam.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await examsService.update(exam.id, { status: newStatus });
      toast({
        title: 'Visibilidade alterada!',
        description: `O status do exame foi alterado para ${newStatus === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}.`,
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

  const activeCategoryLabel =
    CATEGORIES.find((c) => c.key === activeCategory)?.label ?? 'Todas as Categorias';

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Gerenciar Exames"
        subtitle="Gerencie os exames disponíveis na plataforma."
        action={
          <button
            onClick={() => {
              setEditingExamId(undefined);
              setIsModalOpen(true);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Novo Exame
          </button>
        }
      />

      {/* Search and Filters Section */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar exames..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm bg-white text-slate-800"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className={cn(
              'h-[56px] min-w-[180px] pl-4 pr-3 rounded-2xl border text-sm font-bold flex items-center gap-2 transition-all shadow-sm bg-white',
              dropdownOpen
                ? 'border-indigo-400 ring-2 ring-indigo-500/20 text-indigo-600'
                : activeCategory !== 'Todos'
                ? 'border-indigo-300 text-indigo-600 bg-indigo-50'
                : 'border-slate-200 text-slate-600 hover:border-indigo-300',
            )}
          >
            <span className="flex-1 text-left truncate">{activeCategoryLabel}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                dropdownOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400',
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 py-1.5 overflow-hidden">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between gap-2',
                    activeCategory === cat.key
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <span>{cat.label}</span>
                  {activeCategory === cat.key && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active filter chip */}
      {activeCategory !== 'Todos' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filtrando por:</span>
          <button
            onClick={() => setActiveCategory('Todos')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            {activeCategoryLabel}
            <span className="text-indigo-400">×</span>
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="bg-indigo-50 p-5 rounded-2xl mb-4">
            <BookOpen className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {searchTerm ? 'Nenhum exame encontrado' : 'Nenhum exame cadastrado'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos exames com "${searchTerm}".`
              : 'Comece criando o primeiro exame da plataforma.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingExamId(undefined);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Criar Primeiro Exame
            </button>
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
