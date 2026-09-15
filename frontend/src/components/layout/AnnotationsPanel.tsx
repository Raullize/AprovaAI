import { useState } from 'react';
import { NotebookPen, Plus, ArrowLeft, Trash2, StickyNote } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function AnnotationsPanel() {
  const [notes, setNotes] = useLocalStorage<Note[]>('aprovaai:annotations', []);
  const noteList = Array.isArray(notes) ? notes : [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeNote = noteList.find((n) => n.id === activeId) ?? null;

  const createNote = () => {
    const id = crypto.randomUUID();
    const note: Note = { id, title: '', content: '', updatedAt: Date.now() };
    setNotes((prev) => [note, ...prev]);
    setActiveId(id);
  };

  const updateNote = (patch: Partial<Pick<Note, 'title' | 'content'>>) => {
    if (!activeId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId ? { ...n, ...patch, updatedAt: Date.now() } : n,
      ),
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="w-80 sm:w-96 h-[28rem] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl shadow-slate-900/15 border border-slate-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        {activeNote ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveId(null)}
              aria-label="Voltar às anotações"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">
                {activeNote.title || 'Nova anotação'}
              </h3>
              <p className="text-[10px] font-semibold text-slate-400">
                Editando anotação
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteNote(activeNote.id)}
              aria-label="Excluir anotação"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <NotebookPen className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-800">Anotações</h3>
              <p className="text-[10px] font-semibold text-slate-400">
                {noteList.length} anotação{noteList.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={createNote}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {activeNote ? (
        <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => updateNote({ title: e.target.value })}
            placeholder="Título da anotação"
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
          <textarea
            value={activeNote.content}
            onChange={(e) => updateNote({ content: e.target.value })}
            placeholder="Escreva aqui sua anotação..."
            className="flex-1 w-full min-h-[10rem] resize-none text-sm text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
      ) : noteList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <StickyNote className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Nenhuma anotação ainda
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Toque em "Nova" para criar sua primeira anotação.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {noteList.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setActiveId(note.id)}
              className={cn(
                'w-full text-left p-3 rounded-2xl border transition-all',
                'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-slate-800 truncate">
                  {note.title || 'Sem título'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {note.content || 'Sem conteúdo'}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
