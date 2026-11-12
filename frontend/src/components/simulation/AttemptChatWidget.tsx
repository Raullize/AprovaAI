import { useEffect } from 'react';
import { MessagesSquare, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  CHAT_PANEL_CLASSES,
  ProfessorChatPanel,
} from '../layout/ProfessorChatPanel';

interface AttemptChatWidgetProps {
  attemptId: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function AttemptChatWidget({
  attemptId,
  isOpen,
  onToggle,
  onClose,
}: AttemptChatWidgetProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <div className="fixed bottom-20 sm:bottom-28 right-6 z-[60]">
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[55]"
            onClick={onClose}
            aria-hidden="true"
          />

          <div
            className="absolute bottom-[4.5rem] right-0 z-[60]"
            role="dialog"
            aria-modal="true"
            aria-label="Chat com o Professor Sabichão sobre este simulado"
          >
            <ProfessorChatPanel
              attemptId={attemptId}
              className={cn(
                CHAT_PANEL_CLASSES,
                'max-h-[calc(100vh-11rem)] sm:max-h-[calc(100vh-13rem)]',
              )}
            />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-label={
          isOpen
            ? 'Fechar chat sobre este simulado'
            : 'Abrir chat sobre este simulado'
        }
        aria-expanded={isOpen}
        className={cn(
          'relative z-[70] w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all',
          isOpen
            ? 'bg-slate-800 hover:bg-slate-900 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white',
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessagesSquare className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
