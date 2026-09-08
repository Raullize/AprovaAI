import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  Home,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatDuration } from '../../../lib/format';
import { Card } from '../../../components/ui/Card';
import { questionsService } from '../../../services/questions.service';

interface AnswerRecord {
  questionId: string;
  selectedId: string;
  selectedIds?: string[];
  correct: boolean;
}

interface ResultsState {
  answers: AnswerRecord[];
  questions?: ReviewQuestion[];
  total: number;
  correct: number;
  timeSpent: number;
  xpEarned: number;
  passingPercentage: number;
  simulationName: string;
  stars?: number;
  examId?: string;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 30;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function getOptionLabel(index: number) {
  return ['A', 'B', 'C', 'D', 'E'][index] ?? String(index + 1);
}

// Confetti colors (CSS-only burst) - generated once statically to remain pure
const STATIC_CONFETTI_ITEMS = Array.from({ length: 20 }).map((_, i) => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  color: ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa'][i % 5],
  delay: `${Math.random() * 1.5}s`,
  duration: `${1 + Math.random()}s`,
}));

interface ReviewOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
interface ReviewQuestion {
  id: string;
  text: string;
  explanation: string;
  options: ReviewOption[];
  studyLink?: string;
  imageUrl?: string | null;
  type?: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
}

export default function SimulationResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;
  const [resolvedQuestions, setResolvedQuestions] = useState<ReviewQuestion[]>(
    state?.questions ?? [],
  );
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    if (state?.questions?.length) {
      setResolvedQuestions(state.questions);
    }
  }, [state?.questions]);

  useEffect(() => {
    if (!state || state.questions?.length || !state.answers?.length) return;
    const answersToResolve = state.answers;

    async function loadQuestionsForReview() {
      try {
        setIsLoadingQuestions(true);
        const uniqueQuestionIds = Array.from(
          new Set(answersToResolve.map((answer) => answer.questionId)),
        );

        const responses = await Promise.all(
          uniqueQuestionIds.map((questionId) =>
            questionsService.findOne(questionId),
          ),
        );

        const mappedQuestions = responses.map((data) => ({
          id: data.id,
          text: data.content,
          imageUrl: data.imageUrl,
          type: data.type,
          explanation: data.explanation || 'Sem explicação disponível.',
          studyLink: data.studyLink,
          options: [...(data.options ?? [])]
            .sort(
              (a: { order?: number }, b: { order?: number }) =>
                (a.order ?? 0) - (b.order ?? 0),
            )
            .map(
              (option: { id?: string; text: string; isCorrect: boolean }) => ({
                id: option.id ?? '',
                text: option.text,
                isCorrect: option.isCorrect,
              }),
            ),
        }));

        setResolvedQuestions(mappedQuestions);
      } catch (error) {
        console.error('Failed to load review questions:', error);
        setResolvedQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    loadQuestionsForReview();
  }, [state]);

  const {
    total = 0,
    correct = 0,
    timeSpent = 0,
    xpEarned = 0,
    passingPercentage = 0,
    simulationName = '',
    stars: stateStars,
    examId,
  } = state ?? ({} as Partial<ResultsState>);

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = percentage >= passingPercentage;
  const getDynamicStars = (pct: number, passPct: number) => {
    if (pct >= Math.max(90, passPct)) return 3;
    if (pct >= passPct) return 2;
    if (pct >= Math.max(0, passPct - 20)) return 1;
    return 0;
  };
  const stars =
    stateStars !== undefined && stateStars !== null
      ? stateStars
      : getDynamicStars(percentage, passingPercentage);
  const wrong = total - correct;

  const animatedXP = useCountUp(xpEarned);
  const animatedPercentage = useCountUp(percentage);
  const animatedCorrect = useCountUp(correct);
  const animatedWrong = useCountUp(wrong);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarWidth(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const [showReview, setShowReview] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');
  const [activeIndex, setActiveIndex] = useState(0);

  const answers = useMemo(() => {
    const rawAnswers = state?.answers ?? [];
    if (!resolvedQuestions.length) return rawAnswers;

    const answersMap = new Map(rawAnswers.map((a) => [a.questionId, a]));

    return resolvedQuestions.map((q) => {
      const existing = answersMap.get(q.id);
      if (existing) return existing;
      return {
        questionId: q.id,
        selectedId: '',
        selectedIds: [],
        correct: false,
      };
    });
  }, [state?.answers, resolvedQuestions]);

  const indexedAnswers = useMemo(
    () =>
      answers.map((ans, originalIndex) => ({
        ...ans,
        originalIndex,
      })),
    [answers],
  );

  const filteredAnswers = useMemo(() => {
    return indexedAnswers.filter((ans) => {
      if (filter === 'CORRECT') return ans.correct;
      if (filter === 'INCORRECT') return !ans.correct;
      return true;
    });
  }, [indexedAnswers, filter]);

  const confettiItems = STATIC_CONFETTI_ITEMS;

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-md mx-auto">
          <Card padding="normal" className="text-center space-y-4">
            <Trophy className="h-10 w-10 text-slate-300 mx-auto" />
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Resultado indisponivel
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Abra este resultado a partir de um simulado finalizado ou pelo
                historico para carregar os dados corretos.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/simulations')}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
            >
              Ir para historico
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30',
        'pb-40 sm:pb-32',
      )}
    >
      {/* Hero section */}
      <div
        className={cn(
          'relative overflow-hidden pt-12 pb-10 px-4 text-center',
          passed
            ? 'bg-gradient-to-b from-indigo-600 to-violet-600'
            : 'bg-gradient-to-b from-slate-700 to-slate-800',
        )}
      >
        {/* Confetti dots for success */}
        {passed &&
          confettiItems.map((item, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                top: item.top,
                left: item.left,
                backgroundColor: item.color,
                animationDelay: item.delay,
                animationDuration: item.duration,
                opacity: 0.7,
              }}
            />
          ))}

        {/* Trophy */}
        <div className="relative z-10 mb-4">
          <div
            className={cn(
              'w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-2xl',
              passed
                ? 'bg-amber-400 shadow-amber-500/40'
                : 'bg-slate-600 shadow-slate-500/40',
            )}
          >
            {passed ? (
              <Trophy className="h-12 w-12 text-white" />
            ) : (
              <RotateCcw className="h-12 w-12 text-white" />
            )}
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={cn(
                  'h-8 w-8 transition-all',
                  s <= stars
                    ? 'text-amber-400 fill-amber-400 scale-110'
                    : 'text-white/30 fill-white/20',
                )}
                style={{
                  animationDelay: `${s * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-display">
            {passed ? 'Simulado Concluído!' : 'Continue Tentando!'}
          </h1>
          <p className="text-white/70 mt-1.5 text-sm">{simulationName}</p>
          <p className="text-white/60 text-xs mt-1">
            {passed
              ? stars === 3
                ? 'Desempenho perfeito!'
                : 'Parabéns pela aprovação!'
              : `Você precisava de ${passingPercentage}% para passar.`}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {/* Acertos */}
          <Card padding="small" className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {animatedCorrect}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Acertos</p>
          </Card>

          {/* Erros */}
          <Card padding="small" className="text-center">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{animatedWrong}</p>
            <p className="text-xs text-slate-500 mt-0.5">Erros</p>
          </Card>

          {/* XP */}
          <Card padding="small" className="text-center">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-600">+{animatedXP}</p>
            <p className="text-xs text-slate-500 mt-0.5">XP Ganho</p>
          </Card>
        </div>

        {/* Score & time */}
        <div className="mt-3 grid grid-cols-2 gap-3 max-w-md mx-auto">
          {/* Score bar */}
          <Card padding="small" className="col-span-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 font-medium">
                Aproveitamento
              </span>
              <span
                className={cn(
                  'text-sm font-bold',
                  passed ? 'text-green-600' : 'text-red-500',
                )}
              >
                {animatedPercentage}%
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  passed
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-red-400 to-rose-500',
                )}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400">0%</span>
              <span className="text-[10px] text-slate-400">
                Mínimo: {passingPercentage}%
              </span>
            </div>
          </Card>

          {/* Time */}
          <Card
            padding="small"
            className="flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-base font-bold text-slate-700">
              {timeSpent > 0 ? formatDuration(timeSpent) : '—'}
            </p>
            <p className="text-xs text-slate-500">Tempo</p>
          </Card>
        </div>
      </div>

      {/* Review section */}
      <div className="px-4 mt-4">
        <div className="max-w-md mx-auto">
          <button onClick={() => setShowReview(!showReview)} className="w-full">
            <Card
              hoverEffect
              padding="normal"
              className="flex items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-slate-700">
                Revisar Respostas
              </span>
              {showReview ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </Card>
          </button>

          {showReview && answers.length > 0 && (
            <div className="mt-4 space-y-6">
              {/* Filter Selector */}
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setFilter('ALL');
                    setActiveIndex(0);
                  }}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center',
                    filter === 'ALL'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  Todas ({answers.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('CORRECT');
                    setActiveIndex(0);
                  }}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center',
                    filter === 'CORRECT'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-emerald-700',
                  )}
                >
                  Acertos ({answers.filter((a) => a.correct).length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('INCORRECT');
                    setActiveIndex(0);
                  }}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center',
                    filter === 'INCORRECT'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-500 hover:text-rose-700',
                  )}
                >
                  Erros ({answers.filter((a) => !a.correct).length})
                </button>
              </div>

              {filteredAnswers.length > 0 ? (
                <div className="space-y-4">
                  {/* Compact Number Badges Grid */}
                  <div className="flex flex-wrap gap-2 justify-center py-2 bg-slate-50/50 rounded-2xl border border-slate-100 p-3">
                    {filteredAnswers.map((ans, idx) => {
                      const qNum = ans.originalIndex + 1;
                      const isActive = idx === activeIndex;

                      return (
                        <button
                          key={ans.questionId + '-' + idx}
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          className={cn(
                            'w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs transition-all relative',
                            isActive
                              ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
                              : 'hover:scale-105',
                            ans.correct
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                              : 'bg-rose-50 border border-rose-200 text-rose-700',
                          )}
                        >
                          {qNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Question Detailed Card */}
                  {(() => {
                    const ans = filteredAnswers[activeIndex];
                    if (!ans) return null;
                    const displayIndex = ans.originalIndex;
                    const q = resolvedQuestions.find(
                      (question) => question.id === ans.questionId,
                    );
                    if (!q) {
                      return (
                        <Card
                          padding="normal"
                          className="text-center text-sm text-slate-500"
                        >
                          {isLoadingQuestions
                            ? 'Carregando dados da questao...'
                            : 'Nao foi possivel carregar os detalhes desta questao.'}
                        </Card>
                      );
                    }

                    return (
                      <Card
                        padding="normal"
                        className="space-y-4 text-left transition-all"
                      >
                        {/* Question Header */}
                        <div className="flex items-start gap-3">
                          {ans.correct ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              Questão {displayIndex + 1}
                            </h4>
                            <p className="text-slate-650 text-xs mt-1 leading-relaxed">
                              {q.text}
                            </p>

                            {q.imageUrl && (
                              <div className="my-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[220px]">
                                <img
                                  src={
                                    q.imageUrl.startsWith('http')
                                      ? q.imageUrl
                                      : `${import.meta.env.VITE_STATIC_URL || 'http://localhost:3001'}${q.imageUrl.startsWith('/') ? q.imageUrl : `/${q.imageUrl}`}`
                                  }
                                  alt="Imagem da questão"
                                  className="max-h-[220px] object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Options List */}
                        <div className="space-y-2 pl-8">
                          {q.options.map(
                            (opt: ReviewOption, optionIndex: number) => {
                              const isSelected = ans.selectedIds
                                ? ans.selectedIds.includes(opt.id)
                                : opt.id === ans.selectedId;
                              const isCorrect = opt.isCorrect;

                              let optionStyle =
                                'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                              let badge = null;

                              if (isSelected && isCorrect) {
                                optionStyle =
                                  'border-emerald-500 bg-emerald-50 text-emerald-955 font-medium shadow-sm';
                                badge = (
                                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                                    Você acertou
                                  </span>
                                );
                              } else if (!isSelected && isCorrect) {
                                optionStyle =
                                  'border-dashed border-emerald-400 bg-emerald-50/30 text-emerald-800 font-medium';
                                badge = (
                                  <span className="text-[10px] font-semibold bg-slate-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
                                    Gabarito (Não selecionada)
                                  </span>
                                );
                              } else if (isSelected && !isCorrect) {
                                optionStyle =
                                  'border-rose-400 bg-rose-50 text-rose-900 font-medium';
                                badge = (
                                  <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full shrink-0">
                                    Você marcou (Incorreta)
                                  </span>
                                );
                              }

                              return (
                                <div
                                  key={opt.id}
                                  className={cn(
                                    'flex items-start justify-between gap-2.5 p-3 rounded-2xl border text-xs leading-relaxed transition-all',
                                    optionStyle,
                                  )}
                                >
                                  <div className="flex items-start gap-2.5 flex-1">
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0 border border-current mt-0.5">
                                      {getOptionLabel(optionIndex)}
                                    </span>
                                    <span className="text-slate-700 font-medium">
                                      {opt.text}
                                    </span>
                                  </div>
                                  {badge}
                                </div>
                              );
                            },
                          )}
                        </div>

                        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 pl-8 leading-relaxed space-y-2">
                          <div>
                            <span className="font-bold text-slate-700 block mb-1">
                              Explicação:
                            </span>
                            {q.explanation}
                          </div>
                          {q.studyLink && (
                            <div className="pt-2 border-t border-slate-150">
                              <span className="font-bold text-slate-700">
                                Link de Aprofundamento:
                              </span>{' '}
                              <a
                                href={q.studyLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 underline font-medium"
                              >
                                {q.studyLink}
                              </a>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })()}

                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={activeIndex === 0}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors text-center',
                        activeIndex === 0
                          ? 'border-slate-150 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      Anterior
                    </button>
                    <span className="text-xs text-slate-400 font-semibold">
                      {activeIndex + 1} de {filteredAnswers.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((prev) =>
                          Math.min(filteredAnswers.length - 1, prev + 1),
                        )
                      }
                      disabled={activeIndex === filteredAnswers.length - 1}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors text-center',
                        activeIndex === filteredAnswers.length - 1
                          ? 'border-slate-150 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
                  <p className="text-sm font-semibold text-slate-400">
                    Nenhuma questão nesta categoria.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 z-45 shadow-lg shrink-0">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={() =>
              navigate(
                examId ? `/dashboard/explore/${examId}` : '/dashboard/explore',
              )
            }
            className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base border-b-4 border-indigo-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 transition-all shadow-md flex items-center justify-center gap-2"
          >
            Voltar para a Trilha
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-base transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Ir para o Início
          </button>
        </div>
      </div>
    </div>
  );
}
