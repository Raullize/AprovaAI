import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Focus as FocusIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { StudyPanel } from './StudyPanel';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const MODES = {
  focus: { label: 'Foco', icon: FocusIcon, seconds: 25 * 60 },
  short: { label: 'Pausa curta', icon: Coffee, seconds: 5 * 60 },
  long: { label: 'Pausa longa', icon: Coffee, seconds: 15 * 60 },
} as const;

type Mode = keyof typeof MODES;

export function PomodoroPanel() {
  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.seconds);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useLocalStorage<number>(
    'aprovaai:pomodoro-sessions',
    0,
  );
  const modeRef = useRef<Mode>(mode);
  const secondsRef = useRef(secondsLeft);

  useEffect(() => {
    modeRef.current = mode;
    secondsRef.current = secondsLeft;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const next = secondsRef.current - 1;
      secondsRef.current = next;
      setSecondsLeft(next);

      if (next <= 0) {
        const m = modeRef.current;
        if (m === 'focus') {
          setSessions((n) => n + 1);
          setMode('short');
          secondsRef.current = MODES.short.seconds;
          setSecondsLeft(MODES.short.seconds);
        } else {
          setMode('focus');
          secondsRef.current = MODES.focus.seconds;
          setSecondsLeft(MODES.focus.seconds);
        }
        setRunning(false);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running, setSessions]);

  const selectMode = (m: Mode) => {
    setMode(m);
    setSecondsLeft(MODES[m].seconds);
    setRunning(false);
  };

  const reset = () => {
    setSecondsLeft(MODES[mode].seconds);
    setRunning(false);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = secondsLeft / MODES[mode].seconds;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  return (
    <StudyPanel className="w-72 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-slate-800">Pomodoro</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {sessions} sessões hoje
        </span>
      </div>

      {/* Mode selector */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200 mb-4">
        {(Object.keys(MODES) as Mode[]).map((m) => {
          const Icon = MODES[m].icon;
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => selectMode(m)}
              className={cn(
                'flex-1 py-2 rounded-xl text-[10px] font-bold transition-all text-center flex flex-col items-center gap-1',
                active
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {m === 'focus' ? 'Foco' : m === 'short' ? '5 min' : '15 min'}
            </button>
          );
        })}
      </div>

      {/* Timer */}
      <div className="relative w-36 h-36 mx-auto mb-4">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={mode === 'focus' ? '#6366f1' : '#10b981'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'text-3xl font-bold tabular-nums font-display',
              mode === 'focus' ? 'text-slate-800' : 'text-emerald-700',
            )}
          >
            {mm}:{ss}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            {mode === 'focus' ? 'Foco' : 'Pausa'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          aria-label="Reiniciar"
          className="p-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className={cn(
            'w-14 h-14 rounded-2xl text-white shadow-lg flex items-center justify-center transition-all',
            running
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30',
          )}
        >
          {running ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </button>
      </div>
    </StudyPanel>
  );
}
