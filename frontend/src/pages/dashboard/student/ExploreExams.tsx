import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getIconOption, getColorOption } from '../../../config/examThemes';
import { examsService, type Exam } from '../../../services/exams.service';
import Loading from '../../../components/ui/Loading';
import Modal from '../../../components/ui/Modal';
import EmptyState from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/admin/shared/SearchInput';
import { Card } from '../../../components/ui/Card';

const CATEGORY_MAP: Record<string, string> = {
  CONCURSOS: 'Concursos',
  CERTIFICACOES: 'Certificações',
  VESTIBULAR: 'Vestibular',
  OAB: 'OAB',
  OUTROS: 'Outros',
};

const CATEGORIES = [
  { key: 'Todos', label: 'Todas as Categorias' },
  { key: 'CONCURSOS', label: 'Concursos' },
  { key: 'CERTIFICACOES', label: 'Certificações' },
  { key: 'VESTIBULAR', label: 'Vestibular' },
  { key: 'OAB', label: 'OAB' },
  { key: 'OUTROS', label: 'Outros' },
];

export default function ExploreExams() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await examsService.findAll();
        setExams(data.filter((e) => e.status === 'PUBLISHED'));
      } catch {
        setExams([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = exams.filter((exam) => {
    const matchesCategory =
      activeCategory === 'Todos' || exam.category === activeCategory;
    const matchesSearch =
      exam.name.toLowerCase().includes(search.toLowerCase()) ||
      (exam.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCategoryLabel =
    CATEGORIES.find((c) => c.key === activeCategory)?.label ??
    'Todas as Categorias';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            Explorar Catálogo
          </h1>
          <p className="text-slate-500 mt-1">
            Escolha o que você quer estudar hoje e inicie uma nova trilha.
          </p>
        </div>

        {/* Search + Category Dropdown */}
        <div className="mb-8 flex gap-3">
          {/* Search */}
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar exames ou certificações..."
            size="lg"
            className="flex-1"
          />

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
              <span className="flex-1 text-left truncate">
                {activeCategoryLabel}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform duration-200',
                  dropdownOpen
                    ? 'rotate-180 text-indigo-500'
                    : 'text-slate-400',
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
          <div className="mb-5 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Filtrando por:
            </span>
            <button
              onClick={() => setActiveCategory('Todos')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              {activeCategoryLabel}
              <span className="text-indigo-400">×</span>
            </button>
          </div>
        )}

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : exams.length === 0 ? (
          <EmptyState message="Nenhum exame está disponível no momento." />
        ) : filtered.length === 0 ? (
          <EmptyState
            message={`Nenhum exame encontrado para "${search || CATEGORY_MAP[activeCategory] || activeCategory}".`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map((exam) => {
              const iconOpt = getIconOption(exam.iconKey);
              const colorOpt = getColorOption(exam.colorScheme);
              const Icon = iconOpt.Icon;
              return (
                <button
                  key={exam.id}
                  onClick={() => setSelectedExam(exam)}
                  className="group w-full"
                >
                  <Card
                    hoverEffect
                    padding="large"
                    className="text-left flex flex-col h-full group-hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner',
                          colorOpt.gradient,
                        )}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        {exam.category && (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold mb-2">
                            {CATEGORY_MAP[exam.category] || exam.category}
                          </span>
                        )}
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors leading-tight">
                          {exam.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 mb-6 flex-1">
                      {exam.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto w-full">
                      <span className="text-xs font-semibold text-slate-400">
                        {exam.topicsCount} tópicos
                      </span>
                      <span className="text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Ver Trilha &rarr;
                      </span>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        )}

        {/* Preview Modal */}
        <Modal
          isOpen={selectedExam !== null}
          onClose={() => setSelectedExam(null)}
          title="Detalhes do Exame"
          size="md"
        >
          {selectedExam && (
            <div className="flex flex-col items-center text-center p-2">
              <div
                className={cn(
                  'w-20 h-20 rounded-[2rem] flex items-center justify-center bg-gradient-to-br shadow-inner mb-5',
                  getColorOption(selectedExam.colorScheme).gradient,
                )}
              >
                {(() => {
                  const Icon = getIconOption(selectedExam.iconKey).Icon;
                  return <Icon className="h-10 w-10 text-white" />;
                })()}
              </div>

              {selectedExam.category && (
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold mb-3">
                  {CATEGORY_MAP[selectedExam.category] || selectedExam.category}
                </span>
              )}

              <h2 className="text-2xl font-bold text-slate-800 font-display mb-3">
                {selectedExam.name}
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-md">
                {selectedExam.description}
              </p>

              <div className="w-full bg-slate-50 rounded-3xl p-5 mb-8 flex justify-around border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Tópicos
                  </span>
                  <span className="text-xl font-black text-slate-800 mt-1 block font-display">
                    {selectedExam.topicsCount || 0}
                  </span>
                </div>
                <div className="border-l border-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Status
                  </span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block font-display">
                    Disponível
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  navigate(`/dashboard/explore/${selectedExam.id}`);
                  setSelectedExam(null);
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-base font-display shadow-lg shadow-indigo-600/20"
              >
                Iniciar Trilha de Aprendizado
              </button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
