import { useState, useEffect } from 'react';
import { HelpCircle, Link } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import ImageUpload from '@/components/ui/ImageUpload';
import { StatusToggle } from '@/components/admin/shared/StatusToggle';
import { OptionList } from '@/components/admin/questions/OptionList';
import {
  questionsService,
  type Question,
  type Option,
} from '@/services/questions.service';
import { uploadService } from '@/services/upload.service';
import { useToast } from '@/hooks/useToast';

type FormData = {
  content: string;
  imageUrl: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  status: 'PUBLISHED' | 'DRAFT';
  explanation: string;
  studyLink: string;
  options: Option[];
};

const emptyForm = (): FormData => ({
  content: '',
  imageUrl: '',
  type: 'SINGLE_CHOICE',
  status: 'PUBLISHED',
  explanation: '',
  studyLink: '',
  options: [
    { text: '', isCorrect: false, order: 1 },
    { text: '', isCorrect: false, order: 2 },
  ],
});

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  simulationId: string;
  question?: Question | null;
}

export function QuestionFormModal({
  isOpen,
  onClose,
  onSuccess,
  simulationId,
  question,
}: QuestionFormModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormData>(emptyForm());

  useEffect(() => {
    if (!isOpen) return;
    if (question) {
      setForm({
        content: question.content,
        imageUrl: question.imageUrl || '',
        type: question.type || 'SINGLE_CHOICE',
        status: question.status || 'PUBLISHED',
        explanation: question.explanation || '',
        studyLink: question.studyLink || '',
        options: question.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [isOpen, question]);

  const setField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAddOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { text: '', isCorrect: false, order: prev.options.length + 1 },
      ],
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (form.options.length <= 2) {
      toast({ title: 'Mínimo de 2 alternativas', variant: 'destructive' });
      return;
    }
    setForm((prev) => ({
      ...prev,
      options: prev.options
        .filter((_, i) => i !== index)
        .map((o, i) => ({ ...o, order: i + 1 })),
    }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.content.trim()) e.content = 'Conteúdo da questão é obrigatório';

    if (form.studyLink?.trim()) {
      try {
        new URL(form.studyLink);
      } catch {
        e.studyLink = 'URL inválida';
      }
    }

    let correct = 0;
    form.options.forEach((opt, i) => {
      if (!opt.text.trim()) e[`option_${i}`] = 'Texto obrigatório';
      if (opt.isCorrect) correct++;
    });
    if (correct === 0)
      e.options = 'Pelo menos uma alternativa deve estar correta';
    if (form.type === 'SINGLE_CHOICE' && correct > 1)
      e.options = 'Única escolha: apenas uma alternativa correta';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (
        question?.imageUrl &&
        question.imageUrl !== form.imageUrl &&
        question.imageUrl.startsWith('/uploads/')
      ) {
        const filename = question.imageUrl.split('/').pop();
        if (filename) {
          try {
            await uploadService.deleteFile(filename);
          } catch {
            /* ignore */
          }
        }
      }

      const payload = {
        content: form.content.trim(),
        imageUrl: form.imageUrl.trim() || null,
        type: form.type,
        status: form.status,
        explanation: form.explanation.trim() || undefined,
        studyLink: form.studyLink.trim() || undefined,
        simulationId,
        options: form.options.map((opt, i) => ({
          text: opt.text.trim(),
          isCorrect: opt.isCorrect,
          order: i + 1,
        })),
      };

      if (question) {
        await questionsService.update(question.id, payload);
        toast({ title: 'Questão atualizada!', variant: 'success' });
      } else {
        await questionsService.create(payload);
        toast({ title: 'Questão criada!', variant: 'success' });
      }
      onSuccess();
    } catch {
      toast({ title: 'Erro ao salvar questão', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fieldLabel =
    'block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5';
  const fieldInput =
    'w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white text-slate-800 text-sm font-medium resize-none';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? 'Editar Questão' : 'Nova Questão'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image */}
        <div className="space-y-1.5">
          <label className={fieldLabel}>Imagem da Questão (opcional)</label>
          <ImageUpload
            value={form.imageUrl || undefined}
            onChange={(url) => setField('imageUrl', url)}
            onRemove={() => setField('imageUrl', '')}
            disabled={saving}
          />
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className={fieldLabel}>Tipo da Questão</label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type: e.target.value as FormData['type'],
              }))
            }
            disabled={saving}
            className={fieldInput}
          >
            <option value="SINGLE_CHOICE">Única Escolha</option>
            <option value="MULTIPLE_CHOICE">Múltipla Escolha</option>
          </select>
          <p className="text-xs text-slate-400 mt-1">
            {form.type === 'SINGLE_CHOICE'
              ? 'Apenas uma alternativa correta.'
              : 'Uma ou mais alternativas corretas.'}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className={fieldLabel}>
            Conteúdo da Questão <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setField('content', e.target.value)}
            rows={4}
            disabled={saving}
            className={`${fieldInput} ${
              errors.content
                ? 'border-rose-300 bg-rose-50 focus:ring-rose-500/20 focus:border-rose-400'
                : ''
            }`}
            placeholder="Digite o enunciado da questão..."
          />
          {errors.content && (
            <p className="text-sm text-rose-600 font-medium">
              {errors.content}
            </p>
          )}
        </div>

        {/* Options */}
        <OptionList
          options={form.options}
          type={form.type}
          errors={errors}
          disabled={saving}
          onChange={(opts) => setForm((prev) => ({ ...prev, options: opts }))}
          onAdd={handleAddOption}
          onRemove={handleRemoveOption}
        />

        {/* Explanation */}
        <div className="space-y-1.5">
          <label className={fieldLabel}>
            <HelpCircle className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
            Explicação (opcional)
          </label>
          <textarea
            value={form.explanation}
            onChange={(e) => setField('explanation', e.target.value)}
            rows={3}
            disabled={saving}
            className={fieldInput}
            placeholder="Explique por que esta é a resposta correta..."
          />
        </div>

        {/* Study Link */}
        <div className="space-y-1.5">
          <label className={fieldLabel}>
            <Link className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
            Link de Aprofundamento (opcional)
          </label>
          <input
            type="url"
            value={form.studyLink}
            onChange={(e) => setField('studyLink', e.target.value)}
            disabled={saving}
            className={`${fieldInput} ${
              errors.studyLink
                ? 'border-rose-300 bg-rose-50 focus:ring-rose-500/20 focus:border-rose-400'
                : ''
            }`}
            placeholder="https://exemplo.com/material-de-estudo"
          />
          {errors.studyLink && (
            <p className="text-sm text-rose-600 font-medium">
              {errors.studyLink}
            </p>
          )}
          <p className="text-xs text-slate-400">
            Link para material complementar sobre o tema da questão
          </p>
        </div>

        {/* Status */}
        <StatusToggle
          value={form.status}
          onChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
          disabled={saving}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all text-sm shadow-md shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <Loading size="sm" />
            ) : question ? (
              'Atualizar'
            ) : (
              'Criar Questão'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
