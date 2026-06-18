import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import api from '../../../services/api';
import Loading from '../../../components/ui/Loading';
import { getIconOption, getColorOption } from '../../../config/examThemes';
import EmptyState from '../../../components/ui/EmptyState';
import { Card } from '../../../components/ui/Card';

interface HistoryItem {
  id: string;
  levelId: string;
  levelName: string;
  examName: string;
  topicName: string;
  examCategory?: string;
  mode: 'PRACTICE' | 'EXAM';
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  stars?: number;
  timeSpent: number;
  createdAt: string;
  iconKey?: string;
  colorScheme?: string;
  answers?: {
    questionId: string;
    selectedId: string;
    correct: boolean;
  }[];
}

interface ExamGroup {
  examName: string;
  examCategory: string;
  count: number;
  avgPercentage: number;
  iconKey: string;
  colorScheme: string;
  items: HistoryItem[];
}

const CATEGORIES = [
  { key: 'Todos', label: 'Todos' },
  { key: 'CONCURSOS', label: 'Concursos' },
  { key: 'CERTIFICACOES', label: 'Certificações' },
  { key: 'VESTIBULAR', label: 'Vestibular' },
  { key: 'OAB', label: 'OAB' },
  { key: 'OUTROS', label: 'Outros' },
];

interface ApiHistoryItem {
  id: string;
  levelId: string;
  level?: {
    name?: string;
    topic?: {
      name?: string;
      exam?: {
        name?: string;
        category?: string;
        iconKey?: string;
        colorScheme?: string;
      };
    };
  };
  mode: 'PRACTICE' | 'EXAM';
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  passed?: boolean;
  stars?: number;
  timeSpent?: number;
  createdAt: string;
  answers?: {
    questionId: string;
    selectedOptions: string[];
    isCorrect: boolean | null;
  }[];
}

function formatCategoryLabel(category?: string) {
  const found = CATEGORIES.find((c) => c.key === category);
  return found?.label ?? category ?? 'Outros';
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} estrelas`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            'text-sm leading-none',
            i <= value ? 'text-amber-500' : 'text-slate-300',
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function SimulationsHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detail view state
  const [selectedExamName, setSelectedExamName] = useState<string | null>(null);

  // Filters for Main Selection View
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchExams, setSearchExams] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filters for Detailed view state
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'PRACTICE' | 'EXAM'>(
    'ALL',
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>(
    'ALL',
  );
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/simulations/history');
        const data: ApiHistoryItem[] = Array.isArray(response.data)
          ? response.data
          : [];
        const mapped = data.map((item) => ({
          id: item.id,
          levelId: item.levelId,
          levelName: item.level?.name ?? 'Sem nome',
          examName: item.level?.topic?.exam?.name ?? 'Outros',
          topicName: item.level?.topic?.name ?? 'Sem tópico',
          examCategory: item.level?.topic?.exam?.category ?? 'OUTROS',
          mode: item.mode,
          score: item.score ?? 0,
          totalQuestions: item.totalQuestions ?? 0,
          percentage: item.percentage ?? 0,
          passed: item.passed ?? false,
          stars: item.stars ?? 0,
          timeSpent: item.timeSpent ?? 0,
          createdAt: item.createdAt,
          iconKey: item.level?.topic?.exam?.iconKey ?? 'star',
          colorScheme: item.level?.topic?.exam?.colorScheme ?? 'indigo',
          answers:
            item.answers?.map((ans) => ({
              questionId: ans.questionId,
              selectedId: ans.selectedOptions?.[0] ?? '',
              correct: ans.isCorrect ?? false,
            })) ?? [],
        }));
        setHistory(mapped);
      } catch {
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  // Group history by Exam
  const examGroupsMap: Record<string, ExamGroup> = {};
  history.forEach((item) => {
    if (!examGroupsMap[item.examName]) {
      examGroupsMap[item.examName] = {
        examName: item.examName,
        examCategory: item.examCategory || 'OUTROS',
        count: 0,
        avgPercentage: 0,
        iconKey: item.iconKey || 'star',
        colorScheme: item.colorScheme || 'indigo',
        items: [],
      };
    }
    const group = examGroupsMap[item.examName];
    group.count += 1;
    group.items.push(item);
  });

  // Calculate averages
  const examGroups = Object.values(examGroupsMap).map((group) => {
    const totalPercentage = group.items.reduce(
      (sum, item) => sum + item.percentage,
      0,
    );
    group.avgPercentage = Math.round(totalPercentage / group.count);
    return group;
  });

  // Filter main view groups
  const filteredExamGroups = examGroups.filter((group) => {
    const matchesCategory =
      activeCategory === 'Todos' || group.examCategory === activeCategory;
    const matchesSearch = group.examName
      .toLowerCase()
      .includes(searchExams.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter and sort items for detail view
  const selectedGroup = examGroups.find((g) => g.examName === selectedExamName);
  const detailItems = selectedGroup
    ? selectedGroup.items
        .filter((item) => {
          const matchesSearch = item.levelName
            .toLowerCase()
            .includes(search.toLowerCase());
          const matchesMode = modeFilter === 'ALL' || item.mode === modeFilter;
          const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'PASSED' && item.passed) ||
            (statusFilter === 'FAILED' && !item.passed);
          return matchesSearch && matchesMode && matchesStatus;
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
        })
    : [];

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Selection View */}
        {!selectedExamName ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 font-display">
                Meus Simulados
              </h1>
              <p className="text-slate-500 mt-1">
                Selecione um exame abaixo para visualizar seu histórico
                detalhado.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchExams}
                  onChange={(e) => setSearchExams(e.target.value)}
                  placeholder="Buscar exames realizados..."
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
                <Card className="sticky top-24" padding="normal">
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
                </Card>
              </div>

              {/* Exam Groups Grid */}
              <div className="md:col-span-3">
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loading size="lg" />
                  </div>
                ) : filteredExamGroups.length === 0 ? (
                  <EmptyState message="Nenhum exame encontrado com estes filtros." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filteredExamGroups.map((group) => {
                      const iconOpt = getIconOption(group.iconKey);
                      const colorOpt = getColorOption(group.colorScheme);
                      const Icon = iconOpt.Icon;

                      return (
                        <button
                          key={group.examName}
                          onClick={() => setSelectedExamName(group.examName)}
                          className="group w-full"
                        >
                          <Card
                            hoverEffect
                            padding="large"
                            className="text-left flex flex-col justify-between h-full"
                          >
                            <div className="flex items-start gap-4 mb-4">
                              <div
                                className={cn(
                                  'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner',
                                  colorOpt.gradient,
                                )}
                              >
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors truncate">
                                  {group.examName}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                  {group.count}{' '}
                                  {group.count === 1
                                    ? 'simulado feito'
                                    : 'simulados feitos'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 w-full mt-2">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                                  Média Geral
                                </span>
                                <span className="text-base font-black text-slate-800 mt-0.5 block font-display">
                                  {group.avgPercentage}% acertos
                                </span>
                              </div>
                              <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                Ver Histórico &rarr;
                              </span>
                            </div>
                          </Card>
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
          </div>
        ) : (
          /* Detailed Simulations List View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                onClick={() => {
                  setSelectedExamName(null);
                  setSearch('');
                }}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar aos Exames
              </button>
              <h2 className="text-xl font-bold text-slate-800 font-display text-left sm:text-right">
                {selectedExamName}
              </h2>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar pelo nome da fase/nível..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-slate-800 bg-white shadow-sm"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-2.5">
                {/* Mode Filter */}
                <div className="relative">
                  <select
                    value={modeFilter}
                    onChange={(e) =>
                      setModeFilter(
                        e.target.value as 'ALL' | 'PRACTICE' | 'EXAM',
                      )
                    }
                    className="appearance-none pl-3.5 pr-7 py-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer shadow-sm"
                  >
                    <option value="ALL">Modo: Todos</option>
                    <option value="PRACTICE">Treino</option>
                    <option value="EXAM">Simulado</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-550 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as 'ALL' | 'PASSED' | 'FAILED',
                      )
                    }
                    className="appearance-none pl-3.5 pr-7 py-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer shadow-sm"
                  >
                    <option value="ALL">Status: Todos</option>
                    <option value="PASSED">Aprovados</option>
                    <option value="FAILED">Reprovados</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-550 pointer-events-none" />
                </div>

                {/* Sort Order */}
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')
                  }
                  className="px-3 py-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 bg-white flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {sortOrder === 'NEWEST' ? 'Mais recentes' : 'Mais antigos'}
                </button>
              </div>
            </div>

            {/* List */}
            {detailItems.length === 0 ? (
              <EmptyState message="Nenhuma tentativa encontrada com os filtros selecionados." />
            ) : (
              <div className="space-y-4">
                {detailItems.map((item) => (
                  <Card
                    key={item.id}
                    hoverEffect
                    padding="normal"
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-lg text-[9px] font-bold',
                            item.mode === 'EXAM'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-indigo-50 text-indigo-600',
                          )}
                        >
                          {item.mode === 'EXAM' ? 'EXAME' : 'TREINO'}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                          {formatCategoryLabel(item.examCategory)}
                        </span>
                        <Stars value={item.stars ?? 0} />
                      </div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight truncate">
                        {item.levelName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate mt-1">
                        {item.examName} • {item.topicName}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(item.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(item.timeSpent)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-left md:text-right shrink-0">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                          Placar
                        </span>
                        <span className="text-base font-black text-slate-800 block mt-0.5 font-display">
                          {item.score} / {item.totalQuestions} (
                          {item.percentage}%)
                        </span>
                      </div>
                      <div className="shrink-0">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-xl text-xs font-bold border block text-center',
                            item.passed
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-150'
                              : 'bg-red-50 text-red-600 border-red-150',
                          )}
                        >
                          {item.passed ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/dashboard/simulations/results', {
                            state: {
                              answers: item.answers || [],
                              total: item.totalQuestions,
                              correct: item.score,
                              timeSpent: item.timeSpent,
                              xpEarned:
                                item.totalQuestions > 0
                                  ? Math.round(
                                      (item.score / item.totalQuestions) * 60,
                                    )
                                  : 0,
                              passingPercentage: 70,
                              levelName: item.levelName,
                              stars: item.stars,
                            },
                          });
                        }}
                        className="p-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-slate-400 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
