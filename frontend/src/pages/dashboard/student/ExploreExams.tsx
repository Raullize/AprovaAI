import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getIconOption, getColorOption } from '../../../config/examThemes';
import { examsService, type Exam } from '../../../services/exams.service';
import Loading from '../../../components/ui/Loading';

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
    description: 'Prepare-se para a prova da OAB com milhares de questões comentadas e simulados atualizados.',
    category: 'OAB',
    iconKey: 'trophy',
    colorScheme: 'sky',
    topicsCount: 15,
  },
  {
    id: 'enem',
    name: 'ENEM 2026',
    description: 'A trilha completa para você garantir sua vaga na universidade pública.',
    category: 'VESTIBULAR',
    iconKey: 'star',
    colorScheme: 'emerald',
    topicsCount: 22,
  },
  {
    id: 'aws-cpp',
    name: 'AWS Cloud Practitioner',
    description: 'Conquiste a certificação inicial da AWS e impulsione sua carreira em Cloud.',
    category: 'CERTIFICACOES',
    iconKey: 'cpu',
    colorScheme: 'orange',
    topicsCount: 8,
  },
  {
    id: 'pf',
    name: 'Polícia Federal',
    description: 'Questões focadas no edital da PF para os cargos de Agente e Escrivão.',
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

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await examsService.findAll();
        // filter only active exams for students
        const activeExams = data.filter(e => e.status === 'ACTIVE');
        if (activeExams.length > 0) {
          setExams(activeExams);
        } else {
          // fallback fallback mock se o banco estiver vazio
          setExams(CATALOG as any[]);
        }
      } catch {
        setExams(CATALOG as any[]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = exams.filter((exam) => {
    const matchesCategory = activeCategory === 'Todos' || exam.category === activeCategory;
    const matchesSearch = exam.name.toLowerCase().includes(search.toLowerCase()) ||
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

          <div className="hidden md:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-4 py-2 rounded-xl whitespace-nowrap font-medium text-sm transition-all border",
                  activeCategory === cat.key
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-slate-500 text-sm">Nenhum exame encontrado para "{search || CATEGORY_MAP[activeCategory] || activeCategory}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((exam) => {
              const iconOpt  = getIconOption(exam.iconKey);
              const colorOpt = getColorOption(exam.colorScheme);
              const Icon = iconOpt.Icon;
              return (
                <button
                  key={exam.id}
                  onClick={() => navigate(`/dashboard/explore/${exam.id}`)}
                  className="group text-left bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner", colorOpt.gradient)}>
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

                  <p className="text-sm text-slate-500 mb-6 flex-1">{exam.description}</p>

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
  );
}
