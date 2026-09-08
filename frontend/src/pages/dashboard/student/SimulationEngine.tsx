import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { X, Clock, CheckCircle2, XCircle, Flag } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatClock } from '../../../lib/format';
import Modal from '../../../components/ui/Modal';
import { simulationAttemptsService } from '../../../services/simulation-attempts.service';
import { simulationsService } from '../../../services/simulations.service';
import { questionsService } from '../../../services/questions.service';
import Loading from '../../../components/ui/Loading';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import type { SimulationMode } from '../../../types/simulation.types';
import SimulationSummary from '../../../components/simulation/SimulationSummary';

type FeedbackState = 'correct' | 'wrong' | null;

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  explanation: string;
  studyLink?: string;
  order: number;
  imageUrl?: string | null;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
}

interface SimulationConfig {
  name: string;
  timeLimit: number | null;
  passingPercentage: number;
}

const DEFAULT_TIME_LIMIT = 10 * 60; // 10 min in seconds (EXAM mode)

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

export default function SimulationEngine() {
  const { simulationId } = useParams<{ simulationId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as SimulationMode) || 'PRACTICE';
  const examId = searchParams.get('examId');

  const [simulationConfig, setSimulationConfig] =
    useState<SimulationConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [simulationAttemptId, setSimulationAttemptId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_LIMIT);
  const [showExit, setShowExit] = useState(false);
  const [answers, setAnswers] = useState<
    {
      questionId: string;
      selectedId: string;
      selectedIds?: string[];
      correct: boolean;
    }[]
  >([]);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'QUESTION' | 'SUMMARY'>('QUESTION');

  const [feedbackMsg] = useState(
    () => CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)],
  );
  const [wrongMsg] = useState(
    () => WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)],
  );
  const pendingSaveRequestsRef = useRef<Promise<unknown>[]>([]);

  const trackPendingSave = useCallback(<T,>(request: Promise<T>) => {
    pendingSaveRequestsRef.current = [
      ...pendingSaveRequestsRef.current,
      request,
    ];

    request.finally(() => {
      pendingSaveRequestsRef.current = pendingSaveRequestsRef.current.filter(
        (pendingRequest) => pendingRequest !== request,
      );
    });

    return request;
  }, []);

  const waitForPendingSaves = useCallback(async () => {
    const pendingRequests = [...pendingSaveRequestsRef.current];

    if (pendingRequests.length === 0) {
      return;
    }

    await Promise.allSettled(pendingRequests);
  }, []);

  useEffect(() => {
    async function loadSimulation() {
      try {
        setIsLoading(true);
        const lvlData = await simulationsService.findOne(simulationId!);
        setSimulationConfig(lvlData);
        setTimeLeft(lvlData.timeLimit || DEFAULT_TIME_LIMIT);

        const startData = await simulationAttemptsService.start(simulationId!);
        setSimulationAttemptId(startData.id);

        const questionsData = await questionsService.findAll(simulationId!);
        const mappedQuestions = questionsData
          .map((q) => ({
            id: q.id,
            text: q.content,
            imageUrl: q.imageUrl,
            type: q.type,
            explanation: q.explanation || 'Sem explicação disponível.',
            studyLink: q.studyLink,
            order: q.order,
            options: q.options
              .map((o) => ({
                id: o.id ?? '',
                text: o.text,
                isCorrect: o.isCorrect,
                order: o.order,
              }))
              .sort((a: Option, b: Option) => a.order - b.order),
          }))
          .sort((a: Question, b: Question) => a.order - b.order);

        setQuestions(mappedQuestions);

        if (startData.answers && startData.answers.length > 0) {
          const mappedAnswers = startData.answers.map((ans) => ({
            questionId: ans.questionId,
            selectedId: ans.selectedOptions[0] || '',
            correct: ans.isCorrect ?? false,
          }));
          setAnswers(mappedAnswers);

          const mappedFlagged: Record<string, boolean> = {};
          startData.answers.forEach((ans) => {
            if (ans.isFlaggedForReview) {
              mappedFlagged[ans.questionId] = true;
            }
          });
          setFlagged(mappedFlagged);
        }
      } catch (err) {
        console.error('Failed to initialize simulation:', err);
        const msg =
          (err as { response?: { data?: { message?: string | string[] } } })
            .response?.data?.message ||
          'Nao foi possivel iniciar o simulado. Verifique se o nivel possui questoes cadastradas.';
        setInitError(Array.isArray(msg) ? msg[0] : msg);
      } finally {
        setIsLoading(false);
      }
    }

    if (simulationId) {
      loadSimulation();
    }
  }, [simulationId]);

  const saveAnswerToBackend = async (
    questionId: string,
    selectedOptionIds: string[],
    isFlagged: boolean,
  ) => {
    if (!simulationAttemptId) return;

    const request = simulationAttemptsService
      .saveAnswer(simulationAttemptId, {
        questionId,
        selectedOptions: selectedOptionIds,
        timeSpent: 0,
        isFlaggedForReview: isFlagged,
      })
      .catch((err) => {
        console.error('Failed to save answer:', err);
      });

    await trackPendingSave(request);
  };

  const handleFinish = useCallback(async () => {
    if (!simulationAttemptId) return;
    try {
      setIsLoading(true);
      await waitForPendingSaves();

      const baseLimit =
        simulationConfig?.timeLimit && simulationConfig.timeLimit > 0
          ? simulationConfig.timeLimit
          : mode === 'EXAM'
            ? DEFAULT_TIME_LIMIT
            : 0;
      const computedTimeSpent =
        baseLimit > 0 ? Math.max(0, baseLimit - timeLeft) : 0;

      const finishData = await simulationAttemptsService.finish(
        simulationAttemptId,
        {
          timeSpent: computedTimeSpent,
        },
      );
      const { simulationAttempt, xpGained } = finishData;
      const rawResolved =
        simulationAttempt.answers && simulationAttempt.answers.length > 0
          ? simulationAttempt.answers.map((ans) => ({
              questionId: ans.questionId,
              selectedId: ans.selectedOptions[0] || '',
              selectedIds: ans.selectedOptions || [],
              correct: ans.isCorrect ?? false,
            }))
          : answers;

      const resolvedAnswers = questions.map((q) => {
        const existing = rawResolved.find((a) => a.questionId === q.id);
        if (existing) return existing;
        return {
          questionId: q.id,
          selectedId: '',
          selectedIds: [],
          correct: false,
        };
      });
      await refreshUser();

      navigate('/dashboard/simulations/results', {
        state: {
          answers: resolvedAnswers,
          questions,
          total: simulationAttempt.totalQuestions,
          correct: simulationAttempt.score,
          timeSpent: simulationAttempt.timeSpent,
          xpEarned: xpGained,
          stars: simulationAttempt.stars ?? 0,
          passingPercentage: simulationConfig?.passingPercentage || 70,
          simulationName: simulationConfig?.name || 'Simulado',
          examId,
        },
      });
    } catch (err) {
      console.error('Failed to finish simulation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    simulationAttemptId,
    mode,
    simulationConfig?.timeLimit,
    timeLeft,
    refreshUser,
    navigate,
    simulationConfig?.passingPercentage,
    simulationConfig?.name,
    waitForPendingSaves,
    answers,
    questions,
    examId,
  ]);

  // Timer for EXAM mode, or PRACTICE mode if level has timeLimit
  useEffect(() => {
    const hasTimeLimit =
      simulationConfig?.timeLimit && simulationConfig.timeLimit > 0;
    if (mode !== 'EXAM' && !hasTimeLimit) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [mode, timeLeft, handleFinish, simulationConfig?.timeLimit]);

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
      setSelectedOptions(
        existing
          ? existing.selectedIds ||
              (existing.selectedId ? [existing.selectedId] : [])
          : [],
      );
    }
  }, [currentIndex, answers, currentQuestion, mode]);

  if (isLoading || (!currentQuestion && !initError)) {
    return <Loading />;
  }

  if (initError) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6 px-6 text-center z-50">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M12 4a8 8 0 100 16A8 8 0 0012 4z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Nao foi possivel iniciar
          </h2>
          <p className="text-sm text-slate-500 max-w-xs">{initError}</p>
        </div>
        <Button
          variant="gamified"
          onClick={() =>
            navigate(
              examId ? `/dashboard/explore/${examId}` : '/dashboard/explore',
            )
          }
          className="px-6 py-3 rounded-2xl font-bold"
        >
          Voltar para a Trilha
        </Button>
      </div>
    );
  }

  const handleVerify = () => {
    if (selectedOptions.length === 0) return;

    const isMultiple = currentQuestion.type === 'MULTIPLE_CHOICE';
    let correct = false;

    if (isMultiple) {
      const correctOptionIds = currentQuestion.options
        .filter((o) => o.isCorrect)
        .map((o) => o.id);

      correct =
        correctOptionIds.length === selectedOptions.length &&
        correctOptionIds.every((id) => selectedOptions.includes(id));
    } else {
      const selectedOption = selectedOptions[0];
      correct =
        currentQuestion.options.find((o) => o.id === selectedOption)
          ?.isCorrect ?? false;
    }

    setFeedback(correct ? 'correct' : 'wrong');
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedId: selectedOptions[0] || '',
        selectedIds: selectedOptions,
        correct,
      },
    ]);
    saveAnswerToBackend(
      currentQuestion.id,
      selectedOptions,
      !!flagged[currentQuestion.id],
    );
  };

  const handleSelectOption = (optionId: string) => {
    if (feedback !== null) return;

    const isMultiple = currentQuestion.type === 'MULTIPLE_CHOICE';

    if (isMultiple) {
      setSelectedOptions((prev) => {
        const exists = prev.includes(optionId);
        const next = exists
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId];

        if (mode === 'EXAM') {
          setAnswers((prevAnswers) => {
            const existingIdx = prevAnswers.findIndex(
              (a) => a.questionId === currentQuestion.id,
            );
            const newAns = {
              questionId: currentQuestion.id,
              selectedId: next[0] || '',
              selectedIds: next,
              correct: false,
            };
            if (existingIdx >= 0) {
              const updated = [...prevAnswers];
              updated[existingIdx] = newAns;
              return updated;
            }
            return [...prevAnswers, newAns];
          });
          saveAnswerToBackend(
            currentQuestion.id,
            next,
            !!flagged[currentQuestion.id],
          );
        }
        return next;
      });
    } else {
      setSelectedOptions((prev) => {
        const isAlreadySelected = prev.includes(optionId);
        const next = isAlreadySelected ? [] : [optionId];

        if (mode === 'EXAM') {
          if (isAlreadySelected) {
            setAnswers((prevAnswers) =>
              prevAnswers.filter((a) => a.questionId !== currentQuestion.id),
            );
          } else {
            const correct =
              currentQuestion.options.find((o) => o.id === optionId)
                ?.isCorrect ?? false;
            setAnswers((prevAnswers) => {
              const existingIdx = prevAnswers.findIndex(
                (a) => a.questionId === currentQuestion.id,
              );
              const newAns = {
                questionId: currentQuestion.id,
                selectedId: optionId,
                selectedIds: [optionId],
                correct,
              };
              if (existingIdx >= 0) {
                const updated = [...prevAnswers];
                updated[existingIdx] = newAns;
                return updated;
              }
              return [...prevAnswers, newAns];
            });
            saveAnswerToBackend(
              currentQuestion.id,
              [optionId],
              !!flagged[currentQuestion.id],
            );
          }
        }
        return next;
      });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      handleFinish();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOptions([]);
    setFeedback(null);
  };

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
            onClick={() =>
              navigate(examId ? `/dashboard/explore/${examId}` : '/dashboard')
            }
            className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            SAIR
          </button>
        </div>
      </Modal>

      {view === 'SUMMARY' ? (
        <SimulationSummary
          mode={mode}
          timerColor={timerColor}
          timeLeft={timeLeft}
          formatTime={formatClock}
          answers={answers}
          questions={questions}
          flagged={flagged}
          setCurrentIndex={setCurrentIndex}
          setView={setView}
          handleFinish={handleFinish}
          hasTimeLimit={
            !!(simulationConfig?.timeLimit && simulationConfig.timeLimit > 0)
          }
        />
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

            {/* Timer (EXAM mode, or PRACTICE mode if level has timeLimit) */}
            {(mode === 'EXAM' ||
              !!(
                simulationConfig?.timeLimit && simulationConfig.timeLimit > 0
              )) && (
              <div
                className={`flex items-center gap-1.5 font-bold text-sm tabular-nums ${timerColor}`}
              >
                <Clock className="h-4 w-4" />
                {formatClock(timeLeft)}
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
                          if (selectedOptions.length > 0) {
                            saveAnswerToBackend(
                              currentQuestion.id,
                              selectedOptions,
                              newFlag,
                            );
                          }
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

                  {currentQuestion.imageUrl && (
                    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[300px]">
                      <img
                        src={
                          currentQuestion.imageUrl.startsWith('http')
                            ? currentQuestion.imageUrl
                            : `${import.meta.env.VITE_STATIC_URL || 'http://localhost:3001'}${currentQuestion.imageUrl.startsWith('/') ? currentQuestion.imageUrl : `/${currentQuestion.imageUrl}`}`
                        }
                        alt="Imagem da questão"
                        className="max-h-[300px] object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const isCorrectOption = option.isCorrect;

                    let borderClass =
                      'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50';
                    let bgClass = 'bg-white';
                    let labelClass = 'bg-slate-100 text-slate-500';
                    let badge = null;

                    if (feedback !== null) {
                      if (isSelected && isCorrectOption) {
                        borderClass = 'border-green-500';
                        bgClass = 'bg-green-50';
                        labelClass = 'bg-green-500 text-white';
                        badge = (
                          <span className="text-[10px] font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full shrink-0 ml-auto self-center">
                            Você acertou
                          </span>
                        );
                      } else if (!isSelected && isCorrectOption) {
                        borderClass = 'border-dashed border-green-400';
                        bgClass = 'bg-green-50/30';
                        labelClass =
                          'border border-dashed border-green-400 text-green-600 bg-green-50';
                        badge = (
                          <span className="text-[10px] font-semibold bg-slate-100 text-green-700 px-2 py-0.5 rounded-full shrink-0 border border-green-200 ml-auto self-center">
                            Gabarito (Não selecionada)
                          </span>
                        );
                      } else if (isSelected && !isCorrectOption) {
                        borderClass = 'border-red-400';
                        bgClass = 'bg-red-50';
                        labelClass = 'bg-red-500 text-white';
                        badge = (
                          <span className="text-[10px] font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full shrink-0 ml-auto self-center">
                            Você marcou (Incorreta)
                          </span>
                        );
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
                          'w-full text-left flex items-start justify-between gap-3 p-4 rounded-2xl border-2 transition-all duration-200',
                          borderClass,
                          bgClass,
                          feedback === null &&
                            'cursor-pointer active:scale-[0.99]',
                        )}
                      >
                        <div className="flex items-start gap-3 flex-1">
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
                        </div>
                        {badge}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation (PRACTICE mode after answer) */}
                {feedback !== null && mode === 'PRACTICE' && (
                  <div
                    className={cn(
                      'mt-4 p-4 rounded-2xl text-sm leading-relaxed space-y-2',
                      feedback === 'correct'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-orange-50 border border-orange-200 text-orange-800',
                    )}
                  >
                    <div>
                      <p className="font-semibold mb-1">Explicação</p>
                      <p>{currentQuestion.explanation}</p>
                    </div>
                    {currentQuestion.studyLink && (
                      <div className="pt-2 border-t border-slate-200/50">
                        <span className="font-semibold">
                          Link de Aprofundamento:
                        </span>{' '}
                        <a
                          href={currentQuestion.studyLink}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            'underline font-medium',
                            feedback === 'correct'
                              ? 'text-green-700 hover:text-green-900'
                              : 'text-orange-700 hover:text-orange-900',
                          )}
                        >
                          {currentQuestion.studyLink}
                        </a>
                      </div>
                    )}
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
                      <Button
                        type="button"
                        variant="gamified"
                        onClick={() => setView('SUMMARY')}
                        className="px-6 py-4 rounded-2xl font-bold text-sm sm:text-base"
                      >
                        Revisar Prova
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="gamified"
                        onClick={() => setCurrentIndex((i) => i + 1)}
                        className="px-6 py-4 rounded-2xl font-bold text-sm sm:text-base"
                      >
                        Próximo
                      </Button>
                    )}
                  </div>
                ) : feedback === null ? (
                  <button
                    onClick={handleVerify}
                    disabled={selectedOptions.length === 0}
                    className={cn(
                      'w-full py-4 rounded-2xl font-bold text-base transition-all border-b-4',
                      selectedOptions.length > 0
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
