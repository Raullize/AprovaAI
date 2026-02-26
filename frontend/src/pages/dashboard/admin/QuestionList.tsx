import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, HelpCircle, Link, AlertTriangle, ImageIcon, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// ─────────────────── Types ───────────────────
interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Question {
  id: string;
  content: string;
  imageUrl?: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  status: 'ACTIVE' | 'INACTIVE';
  explanation?: string;
  studyLink?: string;
  order: number;
  options: Option[];
}

interface BreadcrumbData {
  examId: string;
  examName: string;
  topicId: string;
  topicName: string;
  levelName: string;
}

type FormData = {
  content: string;
  imageUrl: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  status: 'ACTIVE' | 'INACTIVE';
  explanation: string;
  studyLink: string;
  options: Option[];
};

const BACKEND_URL = 'http://localhost:3001';

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

// ─────────────────── Question Form Modal Content ───────────────────
function QuestionFormContent({
  question,
  onSuccess,
  onCancel,
  levelId,
}: {
  question?: Question | null;
  onSuccess: () => void;
  onCancel: () => void;
  levelId: string;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormData>(emptyForm());

  useEffect(() => {
    if (question) {
      setForm({
        content: question.content,
        imageUrl: question.imageUrl || '',
        type: question.type || 'SINGLE_CHOICE',
        status: question.status || 'ACTIVE',
        explanation: question.explanation || '',
        studyLink: question.studyLink || '',
        options: question.options.map(o => ({ text: o.text, isCorrect: o.isCorrect, order: o.order })),
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [question]);

  const setField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => {
        if (i === index) return { ...opt, [field]: value };
        // For SINGLE_CHOICE, uncheck others when marking one correct
        if (prev.type === 'SINGLE_CHOICE' && field === 'isCorrect' && value === true) {
          return { ...opt, isCorrect: false };
        }
        return opt;
      }),
    }));
    if (errors[`option_${index}`]) setErrors(prev => ({ ...prev, [`option_${index}`]: '' }));
  };

  const addOption = () => {
    setForm(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false, order: prev.options.length + 1 }],
    }));
  };

  const removeOption = (index: number) => {
    if (form.options.length <= 2) {
      toast({ title: 'Mínimo de 2 alternativas', variant: 'destructive' });
      return;
    }
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index).map((o, i) => ({ ...o, order: i + 1 })),
    }));
  };

  // ImageUpload already deletes the physical file when the user clicks remove.
  // Here we only clear the form state — no double API call.
  const handleImageRemove = () => {
    setField('imageUrl', '');
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.content.trim()) e.content = 'Conteúdo da questão é obrigatório';

    if (form.studyLink?.trim()) {
      try { new URL(form.studyLink); } catch { e.studyLink = 'URL inválida'; }
    }

    let correct = 0;
    form.options.forEach((opt, i) => {
      if (!opt.text.trim()) e[`option_${i}`] = 'Texto obrigatório';
      if (opt.isCorrect) correct++;
    });
    if (correct === 0) e.options = 'Pelo menos uma alternativa deve estar correta';
    if (form.type === 'SINGLE_CHOICE' && correct > 1) e.options = 'Única escolha: apenas uma alternativa correta';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // If editing and image changed, delete old image
      if (question?.imageUrl && question.imageUrl !== form.imageUrl && question.imageUrl.startsWith('/uploads/')) {
        const filename = question.imageUrl.split('/').pop();
        if (filename) try { await api.delete(`/upload/${filename}`); } catch { }
      }

      const payload = {
        content: form.content.trim(),
        // Send null (not undefined) so Prisma actually clears the column when imageUrl is removed.
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
        await api.patch(`/questions/${question.id}`, payload);
        toast({ title: 'Questão atualizada!', variant: 'success' });
      } else {
        await api.post('/questions', payload);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagem da Questão (opcional)
        </label>
        <ImageUpload
          value={form.imageUrl || undefined}
          onChange={url => setField('imageUrl', url)}
          onRemove={handleImageRemove}
          disabled={saving}
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo da Questão</label>
        <select
          value={form.type}
          onChange={e => setField('type', e.target.value)}
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
          onChange={e => setField('content', e.target.value)}
          rows={4}
          disabled={saving}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          placeholder="Digite o enunciado da questão..."
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Alternativas <span className="text-red-500">*</span>
          </label>
          <Button type="button" variant="outline" size="sm" onClick={addOption} disabled={saving}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>

        {errors.options && <p className="mb-3 text-sm text-red-600">{errors.options}</p>}

        <div className="space-y-3">
          {form.options.map((option, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mt-2.5 shrink-0">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={e => handleOptionChange(index, 'isCorrect', e.target.checked)}
                  disabled={saving}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Correta</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={option.text}
                  onChange={e => handleOptionChange(index, 'text', e.target.value)}
                  disabled={saving}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${errors[`option_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                />
                {errors[`option_${index}`] && (
                  <p className="mt-1 text-xs text-red-600">{errors[`option_${index}`]}</p>
                )}
              </div>
              {form.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={saving}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors mt-1 shrink-0"
                  title="Remover alternativa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <HelpCircle className="inline h-4 w-4 mr-1 text-gray-400" />
          Explicação (opcional)
        </label>
        <textarea
          value={form.explanation}
          onChange={e => setField('explanation', e.target.value)}
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
          onChange={e => setField('studyLink', e.target.value)}
          disabled={saving}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.studyLink ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          placeholder="https://exemplo.com/material-de-estudo"
        />
        {errors.studyLink && <p className="mt-1 text-sm text-red-600">{errors.studyLink}</p>}
        <p className="mt-1 text-xs text-gray-500">Link para material complementar sobre o tema da questão</p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-700">Status da Questão</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {form.status === 'ACTIVE' ? 'Ativa — visível para os alunos' : 'Inativa — oculta para os alunos'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm(prev => ({ ...prev, status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }))}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${form.status === 'ACTIVE' ? 'bg-primary-600' : 'bg-gray-300'
            }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </button>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loading size="sm" /> : question ? 'Atualizar' : 'Criar Questão'}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────── Main QuestionList Page ───────────────────
export default function QuestionList() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData>({
    examId: '', examName: '', topicId: '', topicName: '', levelName: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const levelRes = await api.get(`/levels/${levelId}`);
      const level = levelRes.data;

      const topicRes = await api.get(`/topics/${level.topicId}`);
      const topic = topicRes.data;

      const examRes = await api.get(`/exams/${topic.examId}`);
      const exam = examRes.data;

      const questionsRes = await api.get(`/questions?levelId=${levelId}`);

      setBreadcrumb({
        examId: exam.id,
        examName: exam.name,
        topicId: topic.id,
        topicName: topic.name,
        levelName: level.name,
      });
      setQuestions(questionsRes.data);
    } catch {
      toast({ title: 'Erro ao carregar questões', variant: 'destructive' });
      navigate('/dashboard/exams');
    } finally {
      setIsLoading(false);
    }
  }, [levelId, toast, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadData();
  };

  const confirmDelete = (q: Question) => {
    setQuestionToDelete(q);
    setDeleteConfirm('');
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      // Delete associated image if any
      if (questionToDelete.imageUrl?.startsWith('/uploads/')) {
        const filename = questionToDelete.imageUrl.split('/').pop();
        if (filename) try { await api.delete(`/upload/${filename}`); } catch { }
      }
      await api.delete(`/questions/${questionToDelete.id}`);
      toast({ title: 'Questão excluída', variant: 'success' });
      setIsDeleteOpen(false);
      setQuestionToDelete(null);
      loadData();
    } catch {
      toast({ title: 'Erro ao excluir questão', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (q: Question) => {
    const newStatus = q.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/questions/${q.id}`, { status: newStatus });
      toast({
        title: newStatus === 'ACTIVE' ? 'Questão ativada' : 'Questão desativada',
        variant: 'success',
      });
      loadData();
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  const typeLabel = (type: string) =>
    type === 'SINGLE_CHOICE' ? 'Única Escolha' : 'Múltipla Escolha';

  const typeColor = (type: string) =>
    type === 'SINGLE_CHOICE'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-between md:space-y-0">
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: 'Exames', href: '/dashboard/exams' },
              { label: breadcrumb.examName || '...', href: `/dashboard/admin/exams/${breadcrumb.examId}/topics` },
              { label: 'Tópicos', href: `/dashboard/admin/exams/${breadcrumb.examId}/topics` },
              { label: breadcrumb.topicName || '...', href: `/dashboard/admin/topics/${breadcrumb.topicId}/levels` },
              { label: 'Níveis', href: `/dashboard/admin/topics/${breadcrumb.topicId}/levels` },
              { label: breadcrumb.levelName || '...', href: '#' },
              { label: 'Questões' },
            ]}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Questões</h1>
            <p className="text-gray-500 mt-1">
              Nível: <span className="font-medium">{breadcrumb.levelName}</span>
              {!isLoading && (
                <span className="ml-2 text-sm text-gray-400">({questions.length} questão{questions.length !== 1 ? 'ões' : ''})</span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-5 w-5 mr-2" />
          Nova Questão
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loading size="lg" />
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma questão cadastrada</h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            Crie questões para este nível e comece a avaliar o conhecimento dos alunos.
          </p>
          <Button onClick={handleCreate}>
            <Plus className="h-5 w-5 mr-2" />
            Criar Primeira Questão
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const previewUrl = q.imageUrl?.startsWith('/uploads/')
              ? `${BACKEND_URL}${q.imageUrl}`
              : q.imageUrl;
            const correctCount = q.options.filter(o => o.isCorrect).length;

            return (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Order badge */}
                  <div className="shrink-0 w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(q.type)}`}>
                        {typeLabel(q.type)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {q.options.length} alternativa{q.options.length !== 1 ? 's' : ''} • {correctCount} correta{correctCount !== 1 ? 's' : ''}
                      </span>
                      {q.imageUrl && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <ImageIcon className="h-3 w-3" /> imagem
                        </span>
                      )}
                      {q.studyLink && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Link className="h-3 w-3" /> link
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-auto ${q.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {q.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>

                    <p className="text-gray-800 text-sm leading-relaxed line-clamp-3 mb-3">
                      {q.content}
                    </p>

                    {previewUrl && (
                      <div className="mb-3">
                        <img
                          src={previewUrl}
                          alt="Imagem"
                          className="h-24 w-auto object-contain rounded border border-gray-200"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Options preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className={`flex items-start gap-1.5 text-xs px-2 py-1 rounded ${opt.isCorrect
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-100'
                            }`}
                        >
                          <span className="font-bold shrink-0 mt-0.5">{String.fromCharCode(65 + oi)}.</span>
                          <span className="line-clamp-2">{opt.text}</span>
                          {opt.isCorrect && <span className="ml-auto shrink-0 text-green-600">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(q)}
                      className={`p-2 rounded-lg transition-colors ${q.status === 'ACTIVE'
                          ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                      title={q.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                    >
                      {q.status === 'ACTIVE' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(q)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(q)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingQuestion ? 'Editar Questão' : 'Nova Questão'}
        size="lg"
      >
        <QuestionFormContent
          question={editingQuestion}
          levelId={levelId!}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Tem certeza absoluta?</h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                Isso excluirá permanentemente a questão e todas as suas alternativas.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Digite <span className="font-mono font-bold">excluir</span> para confirmar:
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 bg-gray-50 -mx-6 -mb-4 px-6 py-4 rounded-b-lg mt-6">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== 'excluir' || isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting && <Loading size="sm" />}
              Excluir Questão
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
