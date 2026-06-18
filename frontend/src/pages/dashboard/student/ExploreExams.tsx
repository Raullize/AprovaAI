import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getIconOption, getColorOption } from '../../../config/examThemes';
import { examsService, type Exam } from '../../../services/exams.service';
import Loading from '../../../components/ui/Loading';
import Modal from '../../../components/ui/Modal';
import EmptyState from '../../../components/ui/EmptyState';

const CATEGORY_MAP: Record<string, string> = {
  CONCURSOS: 'Concursos',
  CERTIFICACOES: 'Certificações',
  VESTIBULAR: 'Vestibular',
  OAB: 'OAB',
  OUTROS: 'Outros',
};

const CATEGORIES = [
  { key: 'Todos', label: 'Todos' },
  { key: 'CONCURSOS', label: 'Concursos' },
  { key: 'CERTIFICACOES', label: 'Certificações' },
  { key: 'VESTIBULAR', label: 'Vestibular' },
  { key: 'OAB', label: 'OAB' },
  { key: 'OUTROS', label: 'Outros' },
];

const CATALOG = [
  {
    id: 'oab',
    name: 'Exame da Ordem (OAB)',
    description:
      'Prepare-se para a prova da OAB com milhares de questões comentadas e simulados atualizados.',
    category: 'OAB',
    iconKey: 'trophy',
    colorScheme: 'sky',
    topicsCount: 15,
  },
  {
    id: 'enem',
    name: 'ENEM 2026',
    description:
      'A trilha completa para você garantir sua vaga na universidade pública.',
    category: 'VESTIBULAR',
    iconKey: 'star',
    colorScheme: 'emerald',
    topicsCount: 22,
  },
  {
    id: 'aws-cpp',
    name: 'AWS Cloud Practitioner',
    description:
      'Conquiste a certificação inicial da AWS e impulsione sua carreira em Cloud.',
    category: 'CERTIFICACOES',
    iconKey: 'cpu',
    colorScheme: 'orange',
    topicsCount: 8,
  },
  {
    id: 'pf',
    name: 'Polícia Federal',
    description:
      'Questões focadas no edital da PF para os cargos de Agente e Escrivão.',
    category: 'CONCURSOS',
    iconKey: 'shield',
    colorScheme: 'slate',
    topicsCount: 18,
  },
];

export default function ExploreExams() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await examsService.findAll();
        // filter only active exams for students
        const activeExams = data.filter((e) => e.status === 'ACTIVE');
        if (activeExams.length > 0) {
          setExams(activeExams);
        } else {
          // fallback fallback mock se o banco estiver vazio
          setExams(CATALOG as unknown as Exam[]);
        }
      } catch {
        setExams(CATALOG as unknown as Exam[]);
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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exames ou certificações..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm bg-white text-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:border-indigo-300 md:hidden"
          >
            <SlidersHorizontal className="h-5 w-5 text-slate-500" />
            Filtrar Categorias
          </button>
        </div>

        <div className="md:grid md:grid-cols-4 md:gap-8">
          {/* Sidebar Filter for Desktop */}
          <div className="hidden md:block md:col-span-1">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 sticky top-24">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Categorias
              </h3>
              <div className="flex flex-col gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
                      activeCategory === cat.key
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="col-span-4 md:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loading size="lg" />
              </div>
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
                      className="group text-left bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col"
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
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer (Bottom Sheet) */}
        <div
          className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-350 md:hidden',
            isMobileFiltersOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none',
          )}
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div
            className={cn(
              'fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-[2.5rem] p-6 transition-transform duration-350 transform flex flex-col shadow-2xl border-t border-slate-100',
              isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-slate-800 mb-4 font-display">
              Filtrar por Categoria
            </h3>
            <div className="flex flex-col gap-1.5 overflow-y-auto mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setIsMobileFiltersOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3.5 rounded-2xl font-medium transition-all text-sm',
                    activeCategory === cat.key
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
            >
              Confirmar Filtro
            </button>
          </div>
        </div>

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
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-850 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-base font-display shadow-lg shadow-indigo-600/20"
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
