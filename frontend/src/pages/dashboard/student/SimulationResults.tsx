import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Home,
  ClipboardList,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { ResultSummary } from '../../../components/simulation/ResultSummary';

interface AnswerRecord {
  questionId: string;
  selectedId: string;
  selectedIds?: string[];
  correct: boolean;
}

interface ResultsState {
  answers: AnswerRecord[];
  total: number;
  correct: number;
  timeSpent: number;
  xpEarned: number;
  passingPercentage: number;
  simulationName: string;
  stars?: number;
  examId?: string;
  fromHistory?: boolean;
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

// Confetti colors (CSS-only burst) - generated once statically to remain pure
const STATIC_CONFETTI_ITEMS = Array.from({ length: 20 }).map((_, i) => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  color: ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa'][i % 5],
  delay: `${Math.random() * 1.5}s`,
  duration: `${1 + Math.random()}s`,
}));

export default function SimulationResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;

  const {
    total = 0,
    correct = 0,
    timeSpent = 0,
    xpEarned = 0,
    passingPercentage = 0,
    simulationName = '',
    stars: stateStars,
    examId,
    fromHistory = false,
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

  const confettiItems = STATIC_CONFETTI_ITEMS;

  const openReview = () => {
    navigate('/dashboard/simulations/review', {
      state: {
        answers: state?.answers ?? [],
        simulationName,
        examId,
        fromHistory,
      },
    });
  };

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
            <Button
              variant="gamified"
              onClick={() => navigate('/dashboard/simulations')}
              className="w-full py-3 rounded-2xl font-bold"
            >
              Ir para historico
            </Button>
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
      {/* Hero + Stats */}
      <ResultSummary
        passed={passed}
        stars={stars}
        simulationName={simulationName}
        passingPercentage={passingPercentage}
        confettiItems={confettiItems}
        animatedCorrect={animatedCorrect}
        animatedWrong={animatedWrong}
        animatedXP={animatedXP}
        animatedPercentage={animatedPercentage}
        barWidth={barWidth}
        timeSpent={timeSpent}
      />

      {/* Review CTA */}
      <div className="px-4 mt-4">
        <div className="max-w-md mx-auto">
          <button onClick={openReview} className="w-full">
            <Card
              hoverEffect
              padding="small"
              className="flex items-center justify-between text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ClipboardList className="h-4 w-4 text-indigo-600" />
                Revisar Respostas
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </Card>
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 z-45 shadow-lg shrink-0">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          {fromHistory ? (
            <Button
              variant="gamified"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 rounded-2xl font-bold text-base gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </Button>
          ) : (
            <Button
              variant="gamified"
              onClick={() =>
                navigate(
                  examId
                    ? `/dashboard/explore/${examId}`
                    : '/dashboard/explore',
                )
              }
              className="flex-1 py-4 rounded-2xl font-bold text-base gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar para a Trilha
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-4 rounded-2xl font-bold text-base gap-2"
          >
            <Home className="h-5 w-5" />
            Ir para o Início
          </Button>
        </div>
      </div>
    </div>
  );
}
