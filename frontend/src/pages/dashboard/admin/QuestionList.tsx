import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  Link,
  AlertTriangle,
  ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
  Search,
  ArrowLeft,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

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
        options: question.options.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [question]);

  const setField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleOptionChange = (
    index: number,
    field: 'text' | 'isCorrect',
    value: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => {
        if (i === index) return { ...opt, [field]: value };
        // For SINGLE_CHOICE, uncheck others when marking one correct
        if (
          prev.type === 'SINGLE_CHOICE' &&
          field === 'isCorrect' &&
          value === true
        ) {
          return { ...opt, isCorrect: false };
        }
        return opt;
      }),
    }));
    if (errors[`option_${index}`])
      setErrors((prev) => ({ ...prev, [`option_${index}`]: '' }));
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { text: '', isCorrect: false, order: prev.options.length + 1 },
      ],
    }));
  };

  const removeOption = (index: number) => {
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

  const handleImageRemove = () => {
    setField('imageUrl', '');
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
        if (filename)
          try {
            await api.delete(`/upload/${filename}`);
          } catch (e) {
            console.error('Error deleting file', e);
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
          onChange={(url) => setField('imageUrl', url)}
          onRemove={handleImageRemove}
          disabled={saving}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo da Questão
        </label>
        <select
          value={form.type}
          onChange={(e) => setField('type', e.target.value)}
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
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Alternativas <span className="text-red-500">*</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={saving}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>

        {errors.options && (
          <p className="mb-3 text-sm text-red-600">{errors.options}</p>
        )}

        <div className="space-y-3">
          {form.options.map((option, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-2 mt-2.5 shrink-0">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) =>
                    handleOptionChange(index, 'isCorrect', e.target.checked)
                  }
                  disabled={saving}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Correta
                </span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(index, 'text', e.target.value)
                  }
                  disabled={saving}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                    errors[`option_${index}`]
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                />
                {errors[`option_${index}`] && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors[`option_${index}`]}
                  </p>
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
      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-700">Status da Questão</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {form.status === 'ACTIVE'
              ? 'Ativa — visível para os alunos'
              : 'Inativa — oculta para os alunos'}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            }))
          }
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            form.status === 'ACTIVE' ? 'bg-primary-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              form.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
  );
}

export default function QuestionList() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData>({
    examId: '',
    examName: '',
    topicId: '',
    topicName: '',
    levelName: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredQuestions = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.options.some((o) =>
            o.text.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      ),
    [questions, searchTerm],
  );

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
      if (questionToDelete.imageUrl?.startsWith('/uploads/')) {
        const filename = questionToDelete.imageUrl.split('/').pop();
        if (filename)
          try {
            await api.delete(`/upload/${filename}`);
          } catch (e) {
            console.error('Error deleting file', e);
          }
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
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, status: newStatus } : item,
        ),
      );
      toast({
        title:
          newStatus === 'ACTIVE' ? 'Questão ativada' : 'Questão desativada',
        variant: 'success',
      });
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const newOrder = [...questions];
    const fromIdx = newOrder.findIndex((q) => q.id === draggedId);
    const toIdx = newOrder.findIndex((q) => q.id === targetId);
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setQuestions(newOrder);
    setDraggedId(null);
    try {
      await api.patch('/questions/reorder', { ids: newOrder.map((q) => q.id) });
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
      loadData();
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
        <div className="flex flex-col gap-4">
          <div className="hidden md:block">
            <Breadcrumb
              items={[
                { label: 'Exames', href: '/dashboard/exams' },
                {
                  label: breadcrumb.examName || '...',
                  href: breadcrumb.examId
                    ? `/dashboard/admin/exams/${breadcrumb.examId}/topics`
                    : '#',
                },
                {
                  label: 'Tópicos',
                  href: breadcrumb.examId
                    ? `/dashboard/admin/exams/${breadcrumb.examId}/topics`
                    : '#',
                },
                {
                  label: breadcrumb.topicName || '...',
                  href: breadcrumb.topicId
                    ? `/dashboard/admin/topics/${breadcrumb.topicId}/levels`
                    : '#',
                },
                {
                  label: 'Níveis',
                  href: breadcrumb.topicId
                    ? `/dashboard/admin/topics/${breadcrumb.topicId}/levels`
                    : '#',
                },
                { label: breadcrumb.levelName || '...', href: '#' },
                { label: 'Questões' },
              ]}
            />
          </div>
          <div>
            <div className="flex items-center">
              <button
                onClick={() =>
                  navigate(
                    breadcrumb.topicId
                      ? `/dashboard/admin/topics/${breadcrumb.topicId}/levels`
                      : '/dashboard/exams',
                  )
                }
                className="mr-3 p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full md:hidden transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Questões</h1>
            </div>
            <p className="text-gray-500 mt-1">
              Nível: <span className="font-medium">{breadcrumb.levelName}</span>
              {!isLoading && (
                <span className="ml-2 text-sm text-gray-400">
                  ({questions.length} questão
                  {questions.length !== 1 ? 'ões' : ''})
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-5 w-5 mr-2" />
          Nova Questão
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Buscar questões por conteúdo ou alternativa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loading size="lg" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-gray-400" />
          </div>
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Nenhuma questão encontrada
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                Não encontramos questões com "{searchTerm}".
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Nenhuma questão cadastrada
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                Crie questões para este nível e comece a avaliar o conhecimento
                dos alunos.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeira Questão
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredQuestions.map((q, idx) => {
            const previewUrl = q.imageUrl?.startsWith('/uploads/')
              ? `${BACKEND_URL}${q.imageUrl}`
              : q.imageUrl;
            const correctCount = q.options.filter((o) => o.isCorrect).length;

            return (
              <div
                key={q.id}
                draggable
                onDragStart={() => handleDragStart(q.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(q.id)}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all p-6 flex flex-col justify-between group ${
                  draggedId === q.id ? 'opacity-40 scale-95' : ''
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    {/* Left: number + status */}
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          q.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {q.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>

                    {/* Right: grip + actions */}
                    <div className="flex items-center gap-0.5">
                      <GripVertical className="h-4 w-4 text-gray-300 cursor-grab active:cursor-grabbing mr-1" />
                      <button
                        onClick={() => handleToggleStatus(q)}
                        className={`p-1.5 rounded-md transition-colors ${
                          q.status === 'ACTIVE'
                            ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                        title={q.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                      >
                        {q.status === 'ACTIVE' ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(q)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(q)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Type chip */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${typeColor(q.type)}`}
                  >
                    {typeLabel(q.type)}
                  </span>

                  {/* Question text */}
                  <p className="text-gray-800 text-sm leading-relaxed line-clamp-3 mb-4">
                    {q.content}
                  </p>

                  {/* Image preview */}
                  {previewUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      <img
                        src={previewUrl}
                        alt="Imagem da questão"
                        className="max-h-32 w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ${
                          opt.isCorrect
                            ? 'bg-green-50 text-green-800 border border-green-100'
                            : 'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}
                      >
                        <span className="font-bold shrink-0 text-xs w-4">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        <span className="line-clamp-1 flex-1">{opt.text}</span>
                        {opt.isCorrect && (
                          <span className="shrink-0 text-green-600 font-bold text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {q.options.length} alternativa
                    {q.options.length !== 1 ? 's' : ''} • {correctCount} correta
                    {correctCount !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {q.imageUrl && <ImageIcon className="h-3.5 w-3.5" />}
                    {q.studyLink && <Link className="h-3.5 w-3.5" />}
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
              <h3 className="text-lg font-medium text-gray-900">
                Tem certeza absoluta?
              </h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                Isso excluirá permanentemente a questão e todas as suas
                alternativas.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Digite <span className="font-mono font-bold">excluir</span> para
              confirmar:
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 bg-gray-50 -mx-6 -mb-4 px-6 py-4 rounded-b-lg mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
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
