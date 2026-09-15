import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/ui/Loading';
import EmptyState from '../../../components/ui/EmptyState';
import {
  ReviewQuestionCard,
  type ReviewAnswer,
  type ReviewQuestion,
} from '../../../components/simulation/ReviewQuestionCard';
import { questionsService } from '../../../services/questions.service';

type ReviewFilter = 'ALL' | 'CORRECT' | 'INCORRECT';

interface ReviewState {
  answers: ReviewAnswer[];
  questions?: ReviewQuestion[];
  simulationName?: string;
  examId?: string;
  total?: number;
  correct?: number;
  fromHistory?: boolean;
}

export default function SimulationReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReviewState | null;

  const [resolvedQuestions, setResolvedQuestions] = useState<ReviewQuestion[]>(
    state?.questions ?? [],
  );
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [filter, setFilter] = useState<ReviewFilter>('ALL');
  const [activeIndex, setActiveIndex] = useState(0);

  const answers = state?.answers ?? [];

  useEffect(() => {
    if (state?.questions?.length) {
      setResolvedQuestions(state.questions);
      return;
    }
    if (!state || !answers.length) return;

    async function loadQuestionsForReview() {
      try {
        setIsLoadingQuestions(true);
        const uniqueQuestionIds = Array.from(
          new Set(answers.map((answer) => answer.questionId)),
        );
        const responses = await Promise.all(
          uniqueQuestionIds.map((questionId) =>
            questionsService.findOne(questionId),
          ),
        );
        const mappedQuestions: ReviewQuestion[] = responses.map((data) => ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const indexedAnswers: (ReviewAnswer & { originalIndex: number })[] =
    answers.map((ans, originalIndex) => ({ ...ans, originalIndex }));

  const filteredAnswers = indexedAnswers.filter((ans) => {
    if (filter === 'CORRECT') return ans.correct;
    if (filter === 'INCORRECT') return !ans.correct;
    return true;
  });

  const activeAnswer = filteredAnswers[activeIndex];
  const activeQuestion = activeAnswer
    ? resolvedQuestions.find((q) => q.id === activeAnswer.questionId)
    : undefined;

  const changePage = (next: number) => {
    setActiveIndex(
      Math.min(Math.max(0, next), Math.max(0, filteredAnswers.length - 1)),
    );
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') changePage(activeIndex - 1);
      if (e.key === 'ArrowRight') changePage(activeIndex + 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, filteredAnswers.length]);

  if (!state || !answers.length) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-md mx-auto">
          <EmptyState message="Abra a revisão a partir de um simulado finalizado para carregar as correções." />
          <div className="mt-4 text-center">
            <Button
              variant="gamified"
              onClick={() => navigate('/dashboard/simulations')}
              className="w-full py-3 rounded-2xl font-bold"
            >
              Ver histórico
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const correctCount = answers.filter((a) => a.correct).length;
  const wrongCount = answers.length - correctCount;

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30',
        'pb-40 sm:pb-32',
      )}
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-slate-800 font-display">
            Correção do Simulado
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {state.simulationName || 'Simulado'}
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">
                {correctCount}
              </p>
              <p className="text-[10px] font-semibold text-emerald-800/70 uppercase tracking-wider">
                Acertos
              </p>
            </div>
            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-rose-700">{wrongCount}</p>
              <p className="text-[10px] font-semibold text-rose-800/70 uppercase tracking-wider">
                Erros
              </p>
            </div>
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-indigo-700">
                {answers.length}
              </p>
              <p className="text-[10px] font-semibold text-indigo-800/70 uppercase tracking-wider">
                Total
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-5 space-y-5">
        {/* Filter */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200 sticky top-0 z-10 backdrop-blur">
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
            Acertos ({correctCount})
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
            Erros ({wrongCount})
          </button>
        </div>

        {isLoadingQuestions ? (
          <div className="flex justify-center py-16">
            <Loading />
          </div>
        ) : filteredAnswers.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
            <p className="text-sm font-semibold text-slate-400">
              Nenhuma questão nesta categoria.
            </p>
          </div>
        ) : (
          <>
            {/* Number badges */}
            <div className="flex flex-wrap gap-2 justify-center bg-slate-50/50 rounded-2xl border border-slate-100 p-3">
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

            {/* Active question card */}
            {activeAnswer && activeQuestion ? (
              <ReviewQuestionCard
                answer={activeAnswer}
                question={activeQuestion}
                questionNumber={activeAnswer.originalIndex + 1}
              />
            ) : (
              <Card
                padding="normal"
                className="text-center text-sm text-slate-500"
              >
                {isLoadingQuestions
                  ? 'Carregando dados da questão...'
                  : 'Não foi possível carregar os detalhes desta questão.'}
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => changePage(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <span className="text-xs text-slate-400 font-semibold">
                {activeIndex + 1} de {filteredAnswers.length}
              </span>
              <Button
                variant="ghost"
                onClick={() => changePage(activeIndex + 1)}
                disabled={activeIndex === filteredAnswers.length - 1}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* CTA buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 z-45 shadow-lg shrink-0">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <Button
            variant="gamified"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 rounded-2xl font-bold text-base gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {state.fromHistory ? 'Voltar' : 'Voltar ao Resultado'}
          </Button>
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
