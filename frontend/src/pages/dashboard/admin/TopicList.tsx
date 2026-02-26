import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronRight, Layers, AlertTriangle, Eye, EyeOff, Search, GripVertical } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Modal from '@/components/ui/Modal';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';

interface Topic {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  _count?: {
    levels: number;
  };
}

// Componente de Formulário dentro do Modal
interface TopicFormProps {
  examId?: string;
  topicId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface TopicFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  examId: string;
}

function TopicFormContent({ examId, topicId, onSuccess, onCancel }: TopicFormProps) {
  const isEditing = !!topicId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<TopicFormData>({
    defaultValues: {
      status: 'ACTIVE',
      examId: examId
    }
  });

  const statusValue = watch('status');

  useEffect(() => {
    const loadTopic = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/topics/${topicId}`);
        const { name, description, status } = response.data;
        reset({
          name,
          description: description || '',
          status,
          examId // Keep examId in the form data
        });
      } catch (error) {
        console.error(error);
        toast({ title: "Erro ao carregar dados", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditing) {
      loadTopic();
    }
  }, [topicId, isEditing, examId, reset, toast]);

  const onSubmit = async (data: TopicFormData) => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await api.patch(`/topics/${topicId}`, data);
        toast({ title: "Tópico atualizado!", variant: "success" });
      } else {
        await api.post('/topics', { ...data, examId });
        toast({ title: "Tópico criado!", variant: "success" });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-8 flex justify-center"><Loading size="md" /></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nome do Tópico"
        placeholder="Ex: Matemática Básica"
        {...register('name', { required: 'Nome é obrigatório' })}
        error={errors.name?.message}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Status toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-700">Status do Tópico</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {statusValue === 'ACTIVE' ? 'Ativo — visível para os alunos' : 'Inativo — oculto para os alunos'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setValue('status', statusValue === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', { shouldDirty: true })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${statusValue === 'ACTIVE' ? 'bg-primary-600' : 'bg-gray-300'
            }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${statusValue === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </button>
        <input type="hidden" {...register('status')} />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loading size="sm" /> : (isEditing ? 'Salvar' : 'Criar')}
        </Button>
      </div>
    </form>
  );
}

export default function TopicList() {
  const { examId } = useParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [examName, setExamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [examRes, topicsRes] = await Promise.all([
        api.get(`/exams/${examId}`),
        api.get(`/topics?examId=${examId}`)
      ]);
      setExamName(examRes.data.name);
      setTopics(topicsRes.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao carregar dados",
        variant: "destructive"
      });
      navigate('/dashboard/exams');
    } finally {
      setIsLoading(false);
    }
  }, [examId, toast, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTopics = useMemo(() => {
    return topics.filter(topic =>
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [topics, searchTerm]);

  const handleCreate = () => {
    setEditingTopicId(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingTopicId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = (topic: Topic) => {
    setTopicToDelete(topic);
    setDeleteConfirmation('');
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!topicToDelete) return;
    try {
      await api.delete(`/topics/${topicToDelete.id}`);
      toast({ title: "Tópico excluído", variant: "success" });
      loadData();
      setIsDeleteModalOpen(false);
      setTopicToDelete(null);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (topic: Topic) => {
    try {
      const newStatus = topic.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/topics/${topic.id}`, { status: newStatus });
      toast({ title: `Tópico ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'}`, variant: "success" });
      loadData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) { setDraggedId(null); return; }
    const newOrder = [...topics];
    const fromIdx = newOrder.findIndex(t => t.id === draggedId);
    const toIdx = newOrder.findIndex(t => t.id === targetId);
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setTopics(newOrder);
    setDraggedId(null);
    try {
      await api.patch('/topics/reorder', { ids: newOrder.map(t => t.id) });
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: 'Exames', href: '/dashboard/exams' },
              { label: examName || 'Carregando...', href: '#' },
              { label: 'Tópicos' }
            ]}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tópicos</h1>
            <p className="text-gray-500 mt-1">Gerencie os assuntos de {examName}.</p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Tópico
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Buscar tópicos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Layers className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchTerm ? 'Nenhum tópico encontrado' : 'Nenhum tópico cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            {searchTerm ? `Não encontramos tópicos com "${searchTerm}".` : 'Comece criando o primeiro tópico para este exame.'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreate}>
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeiro Tópico
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              draggable
              onDragStart={() => handleDragStart(topic.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(topic.id)}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col justify-between group ${draggedId === topic.id ? 'opacity-40 scale-95' : ''
                }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${topic.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {topic.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </div>
                  <div className="flex items-center space-x-1">
                    <GripVertical className="h-4 w-4 text-gray-300 cursor-grab active:cursor-grabbing mr-1" />
                    <button
                      onClick={() => handleToggleStatus(topic)}
                      className={`p-1.5 rounded-md transition-colors ${topic.status === 'ACTIVE'
                        ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                        : 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                      title={topic.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                    >
                      {topic.status === 'ACTIVE' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(topic.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(topic)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                  {topic.description || 'Sem descrição.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {topic._count?.levels || 0} Níveis
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/dashboard/admin/topics/${topic.id}/levels`)}
                  className="text-primary-600 border-primary-200 hover:bg-primary-50"
                >
                  Ver Níveis <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopicId ? 'Editar Tópico' : 'Novo Tópico'}
      >
        <TopicFormContent
          examId={examId}
          topicId={editingTopicId}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Você tem certeza absoluta?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Isso excluirá permanentemente o tópico
                <span className="font-bold text-gray-900"> {topicToDelete?.name} </span>
                e todos os seus níveis e questões.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Digite <span className="font-mono font-bold select-all">excluir</span> para confirmar:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
              autoFocus
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 bg-gray-50 -mx-6 -mb-4 px-6 py-4 rounded-b-lg mt-6">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleteConfirmation !== 'excluir'}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir Tópico
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
