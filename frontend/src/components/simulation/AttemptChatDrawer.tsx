import { useEffect } from 'react';
import { ProfessorChatPanel } from '../layout/ProfessorChatPanel';

interface AttemptChatDrawerProps {
  attemptId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AttemptChatDrawer({
  attemptId,
  isOpen,
  onClose,
}: AttemptChatDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label="Chat com o Professor Sabichão sobre este simulado"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:p-4 flex justify-center sm:justify-end">
        <div className="w-full sm:w-[26rem] h-[80vh] sm:h-full">
          <ProfessorChatPanel
            attemptId={attemptId}
            onClose={onClose}
            className="w-full h-full rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
          />
        </div>
      </div>
    </div>
  );
}
