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
  entityLabel: string; // ex: 'o exame', 'o tópico', 'a questão'
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
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Você tem certeza absoluta?
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Essa ação não pode ser desfeita. Isso excluirá permanentemente{' '}
              {entityLabel}{' '}
              <span className="font-bold text-gray-900">{entityName}</span> e
              removerá todos os dados associados.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Digite{' '}
            <span className="font-mono font-bold select-all">excluir</span> para
            confirmar:
          </label>
          <input
            type="text"
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3 bg-gray-50 -mx-6 -mb-4 px-6 py-4 rounded-b-lg mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <button
            onClick={handleConfirm}
            disabled={confirmation !== 'excluir' || isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2"
          >
            {isDeleting ? <Loading size="sm" /> : 'Excluir'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
