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

// --- Types ---
interface AnswerRecord {
  questionId: string;
  selectedId: string;
  correct: boolean;
}

interface ResultsState {
  answers: AnswerRecord[];
  total: number;
  correct: number;
  timeSpent: number;
  xpEarned: number;
  passingPercentage: number;
  levelName: string;
}

// --- Default fallback mock (accessed directly, no navigation state) ---
const FALLBACK: ResultsState = {
  answers: [],
  total: 5,
  correct: 4,
  timeSpent: 312,
  xpEarned: 48,
  passingPercentage: 70,
  levelName: 'Organização do Estado',
};

// --- Utility ---
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

// --- Animated counter hook ---
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

// --- Star display ---
function getStars(percentage: number): number {
  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
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
}

const QUESTIONS_LOOKUP: Record<string, ReviewQuestion> = {
  q1: {
    id: 'q1',
    text: 'Qual serviço da AWS fornece uma rede virtual dedicada para a sua conta da AWS?',
    explanation:
      'O Amazon Virtual Private Cloud (Amazon VPC) permite provisionar uma seção isolada logicamente da Nuvem AWS onde você pode iniciar recursos da AWS em uma rede virtual definida por você.',
    options: [
      { id: 'a', text: 'Amazon VPC', isCorrect: true },
      { id: 'b', text: 'Amazon EC2', isCorrect: false },
      { id: 'c', text: 'Amazon Route 53', isCorrect: false },
      { id: 'd', text: 'AWS Direct Connect', isCorrect: false },
    ],
  },
  q2: {
    id: 'q2',
    text: 'No modelo de responsabilidade compartilhada da AWS, o que é de responsabilidade da AWS?',
    explanation:
      'A AWS é responsável pela "segurança da nuvem", o que inclui a infraestrutura global (hardware, software, redes e instalações) que executa os serviços.',
    options: [
      { id: 'a', text: 'Configuração de Security Groups', isCorrect: false },
      { id: 'b', text: 'Criptografia de dados de clientes', isCorrect: false },
      { id: 'c', text: 'Segurança da infraestrutura física', isCorrect: true },
      { id: 'd', text: 'Gerenciamento de usuários do IAM', isCorrect: false },
    ],
  },
  q3: {
    id: 'q3',
    text: 'Qual serviço de banco de dados da AWS é totalmente gerenciado e focado em banco de dados relacional (SQL)?',
    explanation:
      'O Amazon Relational Database Service (Amazon RDS) facilita a configuração, operação e escalabilidade de um banco de dados relacional na nuvem.',
    options: [
      { id: 'a', text: 'Amazon DynamoDB', isCorrect: false },
      { id: 'b', text: 'Amazon RDS', isCorrect: true },
      { id: 'c', text: 'Amazon Redshift', isCorrect: false },
      { id: 'd', text: 'Amazon ElastiCache', isCorrect: false },
    ],
  },
  q4: {
    id: 'q4',
    text: 'Qual serviço AWS é ideal para armazenar objetos de forma altamente durável, como backups e arquivos estáticos (imagens/vídeos)?',
    explanation:
      'O Amazon S3 (Simple Storage Service) é um serviço de armazenamento de objetos líder no mercado, oferecendo escalabilidade e durabilidade.',
    options: [
      { id: 'a', text: 'Amazon EBS', isCorrect: false },
      { id: 'b', text: 'Amazon S3', isCorrect: true },
      { id: 'c', text: 'Amazon EFS', isCorrect: false },
      { id: 'd', text: 'Amazon Inspector', isCorrect: false },
    ],
  },
  q5: {
    id: 'q5',
    text: 'Qual serviço oferece computação serverless que permite executar código sem provisionar ou gerenciar servidores?',
    explanation:
      'O AWS Lambda é um serviço de computação serverless e orientado a eventos que permite executar código em resposta a triggers.',
    options: [
      { id: 'a', text: 'Amazon EC2', isCorrect: false },
      { id: 'b', text: 'Amazon ECS', isCorrect: false },
      { id: 'c', text: 'AWS Beanstalk', isCorrect: false },
      { id: 'd', text: 'AWS Lambda', isCorrect: true },
    ],
  },
};

// --- Main Component ---
export default function SimulationResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ResultsState) || FALLBACK;

  const { total, correct, timeSpent, xpEarned, passingPercentage, levelName } =
    state;

  const percentage = Math.round((correct / total) * 100);
  const passed = percentage >= passingPercentage;
  const stars = getStars(percentage);
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

  // Generate mock answers if history doesn't provide them
  const answers = useMemo(() => {
    if (state.answers && state.answers.length > 0) {
      return state.answers;
    }

    const t = state.total || 5;
    const c = state.correct || 0;
    const generated: AnswerRecord[] = [];
    const questionKeys = Object.keys(QUESTIONS_LOOKUP);

    for (let i = 0; i < t; i++) {
      const qKey = questionKeys[i % questionKeys.length];
      const isCorrect = i < c;
      const q = QUESTIONS_LOOKUP[qKey];

      const correctOption = q.options.find((o) => o.isCorrect);
      const wrongOption = q.options.find((o) => !o.isCorrect);

      generated.push({
        questionId: q.id,
        selectedId: isCorrect
          ? correctOption?.id || 'a'
          : wrongOption?.id || 'b',
        correct: isCorrect,
      });
    }
    return generated;
  }, [state.answers, state.total, state.correct]);

  const filteredAnswers = useMemo(() => {
    return answers.filter((ans) => {
      if (filter === 'CORRECT') return ans.correct;
      if (filter === 'INCORRECT') return !ans.correct;
      return true;
    });
  }, [answers, filter]);

  const confettiItems = STATIC_CONFETTI_ITEMS;

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30',
        passed ? 'pb-48 md:pb-32' : 'pb-72 md:pb-52',
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
          {passed && (
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
          )}
        </div>

        {/* Title */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-display">
            {passed ? 'Nível Concluído!' : 'Continue Tentando!'}
          </h1>
          <p className="text-white/70 mt-1.5 text-sm">{levelName}</p>
          <p className="text-white/60 text-xs mt-1">
            {passed
              ? stars === 3
                ? 'Desempenho perfeito! 🌟'
                : 'Parabéns pela aprovação!'
              : `Você precisava de ${passingPercentage}% para passar.`}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {/* Acertos */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {animatedCorrect}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Acertos</p>
          </div>

          {/* Erros */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 text-center">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{animatedWrong}</p>
            <p className="text-xs text-slate-500 mt-0.5">Erros</p>
          </div>

          {/* XP */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 text-center">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-600">+{animatedXP}</p>
            <p className="text-xs text-slate-500 mt-0.5">XP Ganho</p>
          </div>
        </div>

        {/* Score & time */}
        <div className="mt-3 grid grid-cols-2 gap-3 max-w-md mx-auto">
          {/* Score bar */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 col-span-1">
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
          </div>

          {/* Time */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-base font-bold text-slate-700">
              {timeSpent > 0 ? formatTime(timeSpent) : '—'}
            </p>
            <p className="text-xs text-slate-500">Tempo</p>
          </div>
        </div>
      </div>

      {/* Review section */}
      <div className="px-4 mt-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-700">
              Revisar Respostas
            </span>
            {showReview ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
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
                      const originalIndex = answers.findIndex(
                        (a) => a.questionId === ans.questionId,
                      );
                      const qNum =
                        originalIndex !== -1 ? originalIndex + 1 : idx + 1;
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
                    const originalIndex = answers.findIndex(
                      (a) => a.questionId === ans.questionId,
                    );
                    const displayIndex =
                      originalIndex !== -1 ? originalIndex : activeIndex;
                    const q =
                      QUESTIONS_LOOKUP[ans.questionId] ||
                      QUESTIONS_LOOKUP['q' + ((displayIndex % 5) + 1)];
                    if (!q) return null;

                    return (
                      <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4 text-left transition-all">
                        {/* Question Header */}
                        <div className="flex items-start gap-3">
                          {ans.correct ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">
                              Questão {displayIndex + 1}
                            </h4>
                            <p className="text-slate-650 text-xs mt-1 leading-relaxed">
                              {q.text}
                            </p>
                          </div>
                        </div>

                        {/* Options List */}
                        <div className="space-y-2 pl-8">
                          {q.options.map((opt: ReviewOption) => {
                            const isSelected = opt.id === ans.selectedId;
                            const isCorrect = opt.isCorrect;

                            let optionStyle =
                              'border-slate-100 bg-slate-50/50 text-slate-600';
                            if (isCorrect) {
                              optionStyle =
                                'border-emerald-250 bg-emerald-50/60 text-emerald-800 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              optionStyle =
                                'border-rose-250 bg-rose-50/60 text-rose-800 font-semibold';
                            }

                            return (
                              <div
                                key={opt.id}
                                className={cn(
                                  'flex items-center gap-2.5 p-3 rounded-2xl border text-xs leading-relaxed transition-all',
                                  optionStyle,
                                )}
                              >
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0 border border-current">
                                  {opt.id}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-[10px] text-slate-500 pl-8 leading-relaxed">
                          <span className="font-bold text-slate-700 block mb-1">
                            Explicação:
                          </span>
                          {q.explanation}
                        </div>
                      </div>
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
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 space-y-3 z-40">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base border-b-4 border-indigo-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Continuar Trilha
          </button>

          {!passed && (
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-base hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
