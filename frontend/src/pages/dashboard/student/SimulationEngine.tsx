import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { X, Clock, CheckCircle2, XCircle, Flag } from 'lucide-react';
import { cn } from '../../../lib/utils';
import Modal from '../../../components/ui/Modal';
import api from '../../../services/api';
import Loading from '../../../components/ui/Loading';
import { useAuth } from '../../../context/AuthContext';

// --- Types ---
type SimulationMode = 'PRACTICE' | 'EXAM';
type FeedbackState = 'correct' | 'wrong' | null;

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  explanation: string;
}

// --- Mock Data ---
const MOCK_TIME_LIMIT = 10 * 60; // 10 min in seconds (EXAM mode)


// --- Encouragement messages ---
const CORRECT_MESSAGES = [
  { title: 'Excelente!', subtitle: 'Continue assim, você está arrasando!' },
  { title: 'Correto!', subtitle: 'Sua dedicação está fazendo a diferença.' },
  { title: 'Perfeito!', subtitle: 'Mais um passo rumo à aprovação!' },
  { title: 'Isso aí!', subtitle: 'Continue no ritmo!' },
];

const WRONG_MESSAGES = [
  {
    title: 'Quase lá...',
    subtitle: 'Não desanime! Cada erro é um aprendizado.',
  },
  {
    title: 'Não foi dessa vez',
    subtitle: 'Revise a explicação e avance com confiança!',
  },
  {
    title: 'Continue tentando!',
    subtitle: 'A persistência é o caminho da aprovação.',
  },
];

// --- Utility ---
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// --- Main Component ---
export default function SimulationEngine() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as SimulationMode) || 'PRACTICE';

  const [level, setLevel] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [timeLeft, setTimeLeft] = useState(MOCK_TIME_LIMIT);
  const [showExit, setShowExit] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedId: string; correct: boolean }[]
  >([]);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'QUESTION' | 'SUMMARY'>('QUESTION');

  const [feedbackMsg] = useState(
    () => CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)],
  );
  const [wrongMsg] = useState(
    () => WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)],
  );

  useEffect(() => {
    async function loadSimulation() {
      try {
        setIsLoading(true);
        const lvlRes = await api.get(`/levels/${levelId}`);
        setLevel(lvlRes.data);
        setTimeLeft(lvlRes.data.timeLimit || MOCK_TIME_LIMIT);

        const startRes = await api.post('/simulations/start', { levelId });
        setSimulationId(startRes.data.id);

        const qRes = await api.get(`/questions/level/${levelId}`);
        const mappedQuestions = qRes.data.map((q: any) => ({
          id: q.id,
          text: q.content,
          explanation: q.explanation || 'Sem explicação disponível.',
          options: q.options.map((o: any) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect,
          })).sort((a: any, b: any) => a.order - b.order),
        })).sort((a: any, b: any) => a.order - b.order);

        setQuestions(mappedQuestions);

        if (startRes.data.answers && startRes.data.answers.length > 0) {
          const mappedAnswers = startRes.data.answers.map((ans: any) => ({
            questionId: ans.questionId,
            selectedId: ans.selectedOptions[0] || '',
            correct: ans.isCorrect ?? false,
          }));
          setAnswers(mappedAnswers);

          const mappedFlagged: Record<string, boolean> = {};
          startRes.data.answers.forEach((ans: any) => {
            if (ans.isFlaggedForReview) {
              mappedFlagged[ans.questionId] = true;
            }
          });
          setFlagged(mappedFlagged);
        }
      } catch (err) {
        console.error('Failed to initialize simulation:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (levelId) {
      loadSimulation();
    }
  }, [levelId]);

  const saveAnswerToBackend = async (
    questionId: string,
    selectedOptionId: string,
    isFlagged: boolean,
  ) => {
    if (!simulationId) return;
    try {
      await api.post(`/simulations/${simulationId}/answers`, {
        questionId,
        selectedOptions: selectedOptionId ? [selectedOptionId] : [],
        timeSpent: 0,
        isFlaggedForReview: isFlagged,
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleFinish = useCallback(async () => {
    if (!simulationId) return;
    try {
      setIsLoading(true);
      const finishRes = await api.post(`/simulations/${simulationId}/finish`, {
        timeSpent: mode === 'EXAM' ? (level?.timeLimit || MOCK_TIME_LIMIT) - timeLeft : 0,
      });
      const { examResult, xpGained } = finishRes.data;
      await refreshUser();

      navigate('/dashboard/simulations/results', {
        state: {
          answers: examResult.answers.map((ans: any) => ({
            questionId: ans.questionId,
            selectedId: ans.selectedOptions[0] || '',
            correct: ans.isCorrect ?? false,
          })),
          total: examResult.totalQuestions,
          correct: examResult.score,
          timeSpent: examResult.timeSpent,
          xpEarned: xpGained,
          stars: examResult.stars ?? 0,
          passingPercentage: level?.passingPercentage || 70,
          levelName: level?.name || 'Simulado',
        },
      });
    } catch (err) {
      console.error('Failed to finish simulation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [simulationId, mode, level?.timeLimit, timeLeft, refreshUser, navigate, level?.passingPercentage, level?.name]);

  // Timer for EXAM mode
  useEffect(() => {
    if (mode !== 'EXAM') return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [mode, timeLeft, handleFinish]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const answeredCount = answers.filter((a) => a.selectedId !== '').length;
  const progress =
    totalQuestions > 0
      ? mode === 'EXAM'
        ? (answeredCount / totalQuestions) * 100
        : (currentIndex / totalQuestions) * 100
      : 0;

  // Sync selectedOption with saved answers when index changes (EXAM mode)
  useEffect(() => {
    if (mode === 'EXAM' && currentQuestion) {
      const existing = answers.find((a) => a.questionId === currentQuestion.id);
      setSelectedOption(existing ? existing.selectedId : null);
    }
  }, [currentIndex, answers, currentQuestion, mode]);

  if (isLoading || !currentQuestion) {
    return <Loading />;
  }

  const handleVerify = () => {
    if (!selectedOption) return;
    const correct =
      currentQuestion.options.find((o) => o.id === selectedOption)?.isCorrect ??
      false;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, selectedId: selectedOption, correct },
    ]);
    saveAnswerToBackend(currentQuestion.id, selectedOption, !!flagged[currentQuestion.id]);
  };

  const handleSelectOption = (optionId: string) => {
    if (feedback !== null) return;

    if (selectedOption === optionId) {
      setSelectedOption(null);
      if (mode === 'EXAM') {
        setAnswers((prev) =>
          prev.filter((a) => a.questionId !== currentQuestion.id),
        );
        saveAnswerToBackend(currentQuestion.id, '', !!flagged[currentQuestion.id]);
      }
      return;
    }

    setSelectedOption(optionId);
    if (mode === 'EXAM') {
      const correct =
        currentQuestion.options.find((o) => o.id === optionId)?.isCorrect ??
        false;
      setAnswers((prev) => {
        const existingIdx = prev.findIndex(
          (a) => a.questionId === currentQuestion.id,
        );
        const newAns = {
          questionId: currentQuestion.id,
          selectedId: optionId,
          correct,
        };
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = newAns;
          return next;
        }
        return [...prev, newAns];
      });
      saveAnswerToBackend(currentQuestion.id, optionId, !!flagged[currentQuestion.id]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      handleFinish();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
    setFeedback(null);
  };

  const correctOptionId = currentQuestion.options.find((o) => o.isCorrect)?.id;
  const isLastQuestion = currentIndex + 1 === totalQuestions;

  // Timer color
  const timerColor =
    timeLeft > 60
      ? 'text-slate-700'
      : timeLeft > 30
        ? 'text-orange-500'
        : 'text-red-500';

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50 overflow-hidden">
      {/* Exit modal */}
      <Modal
        isOpen={showExit}
        onClose={() => setShowExit(false)}
        title="Sair da Simulação?"
        size="sm"
      >
        <p className="text-slate-600 mb-6 text-sm">
          Seu progresso não será salvo. Tem certeza que deseja voltar para a
          trilha?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExit(false)}
            className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            CANCELAR
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            SAIR
          </button>
        </div>
      </Modal>

      {view === 'SUMMARY' ? (
        <>
          {/* Summary Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 font-display">
              Revisão do Simulado
            </h2>
            {mode === 'EXAM' && (
              <div
                className={`flex items-center gap-1.5 font-bold text-sm tabular-nums ${timerColor}`}
              >
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Summary Body */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <p className="text-slate-500 text-sm">
                  Confira o status de cada questão. Clique no número de qualquer
                  questão para retornar a ela e revisar ou alterar sua resposta.
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-150 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-650">
                    {answers.filter((a) => a.selectedId !== '').length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Respondidas
                  </p>
                </div>

                <div className="bg-amber-50/50 border border-amber-150 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">
                    {Object.values(flagged).filter(Boolean).length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Para Revisar
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-400">
                    {totalQuestions -
                      answers.filter((a) => a.selectedId !== '').length}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Sem Resposta
                  </p>
                </div>
              </div>

              {/* Badges grid */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-4 justify-items-center">
                  {questions.map((q, idx) => {
                    const isAnswered = answers.some(
                      (a) => a.questionId === q.id && a.selectedId !== '',
                    );
                    const isFlagged = flagged[q.id];
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setView('QUESTION');
                        }}
                        className={cn(
                          'w-12 h-12 rounded-2xl font-bold flex items-center justify-center border-2 transition-all relative text-sm',
                          isFlagged
                            ? 'bg-amber-50 border-amber-500 text-amber-700 hover:bg-amber-100/50'
                            : isAnswered
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-750 hover:bg-emerald-100/50'
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50',
                        )}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 border border-white rounded-full flex items-center justify-center">
                            <Flag className="w-2.5 h-2.5 text-white fill-current" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-5 mt-6 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-400" />
                    <span>Respondida</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-400" />
                    <span>Revisar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-white border border-slate-200" />
                    <span>Não respondida</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-4">
            <div className="max-w-2xl mx-auto flex gap-4">
              <button
                type="button"
                onClick={() => setView('QUESTION')}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-sm sm:text-base"
              >
                Voltar para a Prova
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-4 rounded-2xl font-bold text-white bg-green-600 hover:bg-green-700 border-b-4 border-green-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 shadow-md transition-all text-sm sm:text-base text-center"
              >
                Finalizar Simulado
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ─── Header ─── */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
            {/* Exit button */}
            <button
              onClick={() => setShowExit(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Progress bar */}
            <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Timer (EXAM only) */}
            {mode === 'EXAM' && (
              <div
                className={`flex items-center gap-1.5 font-bold text-sm tabular-nums ${timerColor}`}
              >
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            )}

            {/* Question counter */}
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              {currentIndex + 1}/{totalQuestions}
            </span>
          </div>

          {/* ─── Body — scrollable ─── */}
          <div className="flex-1 overflow-hidden flex">
            {/* Main Content Area (Questions) */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="max-w-2xl mx-auto">
                {/* Question text */}
                <div className="mt-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
                      Questão {currentIndex + 1}
                    </p>
                    {mode === 'EXAM' && (
                      <button
                        onClick={() => {
                          const newFlag = !flagged[currentQuestion.id];
                          setFlagged((prev) => ({
                            ...prev,
                            [currentQuestion.id]: newFlag,
                          }));
                          saveAnswerToBackend(currentQuestion.id, selectedOption || '', newFlag);
                        }}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
                          flagged[currentQuestion.id]
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-655 hover:bg-slate-50',
                        )}
                      >
                        <Flag
                          className={cn(
                            'h-3.5 w-3.5',
                            flagged[currentQuestion.id] && 'fill-amber-500',
                          )}
                        />
                        {flagged[currentQuestion.id]
                          ? 'Marcada para Revisar'
                          : 'Marcar para Revisar'}
                      </button>
                    )}
                  </div>
                  <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed">
                    {currentQuestion.text}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    const isCorrectOption = option.id === correctOptionId;

                    let borderClass =
                      'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50';
                    let bgClass = 'bg-white';
                    let labelClass = 'bg-slate-100 text-slate-500';

                    if (feedback !== null) {
                      if (isCorrectOption) {
                        borderClass = 'border-green-400';
                        bgClass = 'bg-green-50';
                        labelClass = 'bg-green-505 text-white';
                      } else if (isSelected && !isCorrectOption) {
                        borderClass = 'border-red-400';
                        bgClass = 'bg-red-50';
                        labelClass = 'bg-red-505 text-white';
                      } else {
                        borderClass = 'border-slate-200 opacity-60';
                      }
                    } else if (isSelected) {
                      borderClass = 'border-indigo-500';
                      bgClass = 'bg-indigo-50';
                      labelClass = 'bg-indigo-600 text-white';
                    }

                    const optionLabel = ['A', 'B', 'C', 'D', 'E'][
                      currentQuestion.options.indexOf(option)
                    ];

                    return (
                      <button
                        key={option.id}
                        disabled={feedback !== null}
                        onClick={() => handleSelectOption(option.id)}
                        className={cn(
                          'w-full text-left flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-200',
                          borderClass,
                          bgClass,
                          feedback === null &&
                            'cursor-pointer active:scale-[0.99]',
                        )}
                      >
                        <span
                          className={cn(
                            'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors',
                            labelClass,
                          )}
                        >
                          {optionLabel}
                        </span>
                        <span className="text-sm sm:text-base text-slate-700 font-medium leading-snug pt-0.5">
                          {option.text}
                        </span>
                        {feedback !== null && isCorrectOption && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 ml-auto mt-0.5" />
                        )}
                        {feedback !== null &&
                          isSelected &&
                          !isCorrectOption && (
                            <XCircle className="h-5 w-5 text-red-500 shrink-0 ml-auto mt-0.5" />
                          )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation (PRACTICE mode after answer) */}
                {feedback !== null && mode === 'PRACTICE' && (
                  <div
                    className={cn(
                      'mt-4 p-4 rounded-2xl text-sm leading-relaxed',
                      feedback === 'correct'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-orange-50 border border-orange-200 text-orange-800',
                    )}
                  >
                    <p className="font-semibold mb-1">Explicação</p>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Footer ─── */}
          <div className="shrink-0">
            {/* PRACTICE feedback banner */}
            {feedback !== null && mode === 'PRACTICE' && (
              <div
                className={cn(
                  'px-4 pt-4 pb-2 flex items-center gap-3 animate-slide-up',
                  feedback === 'correct' ? 'bg-green-500' : 'bg-red-500',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    feedback === 'correct' ? 'bg-green-400' : 'bg-red-400',
                  )}
                >
                  {feedback === 'correct' ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <XCircle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base">
                    {feedback === 'correct'
                      ? feedbackMsg.title
                      : wrongMsg.title}
                  </p>
                  <p className="text-white/80 text-xs truncate">
                    {feedback === 'correct'
                      ? feedbackMsg.subtitle
                      : wrongMsg.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* Action button */}
            <div
              className={cn(
                'px-4 py-4',
                mode === 'PRACTICE' && feedback !== null
                  ? feedback === 'correct'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : 'bg-white border-t border-slate-200',
              )}
            >
              <div className="max-w-2xl mx-auto">
                {mode === 'EXAM' ? (
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
                      }}
                      disabled={currentIndex === 0}
                      className={cn(
                        'px-6 py-4 rounded-2xl font-bold border-2 transition-all text-sm sm:text-base',
                        currentIndex === 0
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 text-slate-650 hover:bg-slate-50 active:scale-95',
                      )}
                    >
                      Anterior
                    </button>

                    <button
                      type="button"
                      onClick={() => setView('SUMMARY')}
                      className="px-6 py-4 rounded-2xl font-bold border-2 border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all text-sm sm:text-base active:scale-95"
                    >
                      Revisar Questões
                    </button>

                    {isLastQuestion ? (
                      <button
                        type="button"
                        onClick={() => setView('SUMMARY')}
                        className="px-6 py-4 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 shadow-md text-sm sm:text-base transition-all"
                      >
                        Revisar Prova
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((i) => i + 1)}
                        className="px-6 py-4 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 shadow-md text-sm sm:text-base transition-all"
                      >
                        Próximo
                      </button>
                    )}
                  </div>
                ) : feedback === null ? (
                  <button
                    onClick={handleVerify}
                    disabled={!selectedOption}
                    className={cn(
                      'w-full py-4 rounded-2xl font-bold text-base transition-all border-b-4',
                      selectedOption
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-800 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 shadow-md'
                        : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed',
                    )}
                  >
                    VERIFICAR
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className={cn(
                      'w-full py-4 rounded-2xl font-bold text-base transition-all border-b-4',
                      feedback === 'correct'
                        ? 'bg-white text-green-600 border-green-200 hover:bg-green-50'
                        : 'bg-white text-red-600 border-red-200 hover:bg-red-50',
                      'hover:-translate-y-0.5 active:translate-y-0 active:border-b-2',
                    )}
                  >
                    {isLastQuestion ? 'VER RESULTADO' : 'CONTINUAR'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
