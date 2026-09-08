import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  entityName: string;
  entityLabel: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  entityLabel,
}: DeleteConfirmModalProps) {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    setConfirmation('');
    onClose();
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      setConfirmation('');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirmar Exclusão"
      size="md"
    >
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Pulsing danger icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
            <div className="relative bg-red-100 p-4 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Você tem certeza absoluta?
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              Essa ação não pode ser desfeita. Isso excluirá permanentemente{' '}
              {entityLabel}{' '}
              <span className="font-semibold text-slate-800">
                "{entityName}"
              </span>{' '}
              e todos os dados associados.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Digite{' '}
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded select-all">
              excluir
            </span>{' '}
            para confirmar:
          </label>
          <input
            type="text"
            autoFocus
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={confirmation !== 'excluir' || isDeleting}
            className="px-5 py-2 rounded-xl shadow-sm gap-2"
          >
            {isDeleting ? <Loading size="sm" /> : 'Excluir'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
