import { useState, useEffect } from 'react';
import { HelpCircle, Link } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
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
import { useToast } from '@/hooks/use-toast';

type FormData = {
  content: string;
  imageUrl: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  status: 'ACTIVE' | 'INACTIVE';
  explanation: string;
  studyLink: string;
  options: Option[];
};

const emptyForm = (): FormData => ({
  content: '',
  imageUrl: '',
  type: 'SINGLE_CHOICE',
  status: 'ACTIVE',
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
  levelId: string;
  question?: Question | null;
}

export function QuestionFormModal({
  isOpen,
  onClose,
  onSuccess,
  levelId,
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
        status: question.status || 'ACTIVE',
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
      // Clean up old image if changed
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
        levelId,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? 'Editar Questão' : 'Nova Questão'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem da Questão (opcional)
          </label>
          <ImageUpload
            value={form.imageUrl || undefined}
            onChange={(url) => setField('imageUrl', url)}
            onRemove={() => setField('imageUrl', '')}
            disabled={saving}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo da Questão
          </label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type: e.target.value as FormData['type'],
              }))
            }
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="SINGLE_CHOICE">Única Escolha</option>
            <option value="MULTIPLE_CHOICE">Múltipla Escolha</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {form.type === 'SINGLE_CHOICE'
              ? 'Apenas uma alternativa correta.'
              : 'Uma ou mais alternativas corretas.'}
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo da Questão <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setField('content', e.target.value)}
            rows={4}
            disabled={saving}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
              errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Digite o enunciado da questão..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <HelpCircle className="inline h-4 w-4 mr-1 text-gray-400" />
            Explicação (opcional)
          </label>
          <textarea
            value={form.explanation}
            onChange={(e) => setField('explanation', e.target.value)}
            rows={3}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Explique por que esta é a resposta correta..."
          />
        </div>

        {/* Study Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Link className="inline h-4 w-4 mr-1 text-gray-400" />
            Link de Aprofundamento (opcional)
          </label>
          <input
            type="url"
            value={form.studyLink}
            onChange={(e) => setField('studyLink', e.target.value)}
            disabled={saving}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.studyLink ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="https://exemplo.com/material-de-estudo"
          />
          {errors.studyLink && (
            <p className="mt-1 text-sm text-red-600">{errors.studyLink}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Link para material complementar sobre o tema da questão
          </p>
        </div>

        {/* Status */}
        <StatusToggle
          value={form.status}
          onChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
          disabled={saving}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loading size="sm" />
            ) : question ? (
              'Atualizar'
            ) : (
              'Criar Questão'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
