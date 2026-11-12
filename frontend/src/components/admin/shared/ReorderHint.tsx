import { useState } from 'react';
import { Eye, MoveHorizontal } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getIconOption, getColorOption } from '@/config/examThemes';
import { cn } from '@/lib/utils';

export interface ReorderPreviewItem {
  id: string;
  name: string;
  description?: string;
  iconKey?: string | null;
  colorScheme?: string | null;
  meta?: string;
}

interface ReorderHintProps {
  entityLabel: string;
  items: ReorderPreviewItem[];
  display?: 'catalog' | 'list';
}

export function ReorderHint({
  entityLabel,
  items,
  display = 'list',
}: ReorderHintProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200 flex items-center justify-center shrink-0">
            <MoveHorizontal className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800">
              Arraste para reordenar.
            </span>{' '}
            A ordem definida aqui é a mesma exibida para os alunos nos{' '}
            {entityLabel}.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreviewOpen(true)}
          className="shrink-0 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 text-xs gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          Pré-visualizar
        </Button>
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Como os alunos veem (${entityLabel})`}
        size="md"
      >
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Nenhum item para pré-visualizar.
          </p>
        ) : display === 'catalog' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => {
              const Icon = getIconOption(item.iconKey).Icon;
              const colorOpt = getColorOption(item.colorScheme);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0',
                        colorOpt.gradient,
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {item.name}
                      </p>
                      {item.meta && (
                        <p className="text-xs text-slate-400">{item.meta}</p>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <ol className="space-y-2">
            {items.map((item, index) => {
              const Icon = getIconOption(item.iconKey).Icon;
              const colorOpt = getColorOption(item.colorScheme);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0',
                      colorOpt.gradient,
                    )}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 truncate flex-1">
                    {item.name}
                  </span>
                  {item.meta && (
                    <span className="text-xs text-slate-400 shrink-0">
                      {item.meta}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        <p className="text-xs text-slate-400 mt-4 text-center">
          Pré-visualização ilustrativa da ordem atual.
        </p>
      </Modal>
    </>
  );
}
