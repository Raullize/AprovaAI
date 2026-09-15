import { useEffect, useRef, useState } from 'react';
import {
  Timer,
  NotebookPen,
  GraduationCap,
  X,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PomodoroPanel } from './PomodoroPanel';
import { AnnotationsPanel } from './AnnotationsPanel';
import { ProfessorChatPanel } from './ProfessorChatPanel';

type Tool = 'pomodoro' | 'annotations' | 'chatbot';

const TOOLS: { id: Tool; label: string; icon: typeof Timer }[] = [
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'annotations', label: 'Anotações', icon: NotebookPen },
  { id: 'chatbot', label: 'Professor Sabichão', icon: GraduationCap },
];

export function FloatingStudyWidget() {
  const [open, setOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveTool(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      setActiveTool(null);
    } else {
      setOpen(true);
    }
  };

  const handleSelect = (tool: Tool) => {
    setActiveTool(tool);
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 md:bottom-6 right-6 z-40"
    >
      {/* Panel / Menu */}
      {open && (
        <div className="absolute bottom-20 right-0 flex flex-col items-end gap-2">
          {activeTool ? (
            activeTool === 'pomodoro' ? (
              <PomodoroPanel />
            ) : activeTool === 'annotations' ? (
              <AnnotationsPanel />
            ) : (
              <ProfessorChatPanel />
            )
          ) : (
            <div className="w-64 bg-white rounded-3xl shadow-2xl shadow-slate-900/15 border border-slate-200 p-2">
              <div className="px-3 py-2 mb-1">
                <p className="text-xs font-bold text-slate-800">
                  Ferramentas de Estudo
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Escolha uma opção
                </p>
              </div>
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleSelect(tool.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all',
                      'hover:bg-indigo-50/60 hover:text-indigo-700',
                    )}
                  >
                    <span
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                        tool.id === 'pomodoro'
                          ? 'bg-rose-50 text-rose-600'
                          : tool.id === 'annotations'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-violet-50 text-violet-600',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {tool.label}
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-slate-300 ml-auto" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          open ? 'Fechar ferramentas de estudo' : 'Abrir ferramentas de estudo'
        }
        className={cn(
          'w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all',
          open
            ? 'bg-slate-800 hover:bg-slate-900 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white',
        )}
      >
        {open ? <X className="h-6 w-6" /> : <LayoutGrid className="h-6 w-6" />}
      </button>
    </div>
  );
}
