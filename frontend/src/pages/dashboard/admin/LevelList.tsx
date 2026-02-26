import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart, ChevronRight, Edit2, Eye, EyeOff, Plus, Trash2, Search, AlertTriangle, GripVertical } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

interface Level {
  id: string;
  name: string;
  xpReward: number;
  passingPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  _count?: {
    questions: number;
  };
}

interface LevelFormProps {
  topicId?: string;
  levelId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface LevelFormData {
  name: string;
  xpReward: number;
  passingPercentage: number;
  topicId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

function LevelFormContent({ topicId, levelId, onSuccess, onCancel }: LevelFormProps) {
  const isEditing = !!levelId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<LevelFormData>({
    defaultValues: {
      topicId: topicId,
      xpReward: 10,
      passingPercentage: 70,
      status: 'ACTIVE',
    }
  });

  const statusValue = watch('status');

  useEffect(() => {
    const loadLevel = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/levels/${levelId}`);
        const { name, xpReward, passingPercentage, status } = response.data;
        reset({
          name,
          xpReward,
          passingPercentage,
          status: status || 'ACTIVE',
          topicId
        });
      } catch (error) {
        console.error(error);
        toast({ title: "Erro ao carregar dados", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditing) {
      loadLevel();
    }
  }, [levelId, isEditing, topicId, reset, toast]);

  const onSubmit = async (data: LevelFormData) => {
    try {
      setIsSaving(true);
      // Converter para número
      const payload = {
        ...data,
        xpReward: Number(data.xpReward),
        passingPercentage: Number(data.passingPercentage)
      };

      if (isEditing) {
        await api.patch(`/levels/${levelId}`, payload);
        toast({ title: "Nível atualizado!", variant: "success" });
      } else {
        await api.post('/levels', { ...payload, topicId });
        toast({ title: "Nível criado!", variant: "success" });
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
        label="Nome do Nível"
        placeholder="Ex: Fácil, Médio, Difícil"
        {...register('name', { required: 'Nome é obrigatório' })}
        error={errors.name?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Recompensa (XP)"
          type="number"
          {...register('xpReward', {
            required: 'XP é obrigatório',
            min: { value: 0, message: 'Deve ser maior ou igual a 0' }
          })}
          error={errors.xpReward?.message}
        />

        <Input
          label="Aprovação Mínima (%)"
          type="number"
          {...register('passingPercentage', {
            required: 'Porcentagem é obrigatória',
            min: { value: 0, message: 'Mínimo 0%' },
            max: { value: 100, message: 'Máximo 100%' }
          })}
          error={errors.passingPercentage?.message}
        />
      </div>

      {/* Status toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-700">Status do Nível</p>
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

export default function LevelList() {
  const { topicId } = useParams();
  const [levels, setLevels] = useState<Level[]>([]);
  const [topicName, setTopicName] = useState('');
  const [examName, setExamName] = useState('');
  const [examId, setExamId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevelId, setEditingLevelId] = useState<string | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Carregar tópico para pegar examId
      const topicRes = await api.get(`/topics/${topicId}`);
      const topic = topicRes.data;
      setTopicName(topic.name);
      setExamId(topic.examId);

      // Carregar exame para o breadcrumb
      const examRes = await api.get(`/exams/${topic.examId}`);
      setExamName(examRes.data.name);

      // Carregar níveis
      const levelsRes = await api.get(`/levels?topicId=${topicId}`);
      setLevels(levelsRes.data);
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
  }, [topicId, toast, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLevels = useMemo(() => {
    return levels.filter(level =>
      level.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [levels, searchTerm]);

  const handleCreate = () => {
    setEditingLevelId(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingLevelId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = (level: Level) => {
    setLevelToDelete(level);
    setDeleteConfirmation('');
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!levelToDelete) return;
    try {
      await api.delete(`/levels/${levelToDelete.id}`);
      toast({ title: "Nível excluído", variant: "success" });
      loadData();
      setIsDeleteModalOpen(false);
      setLevelToDelete(null);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (level: Level) => {
    const newStatus = level.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/levels/${level.id}`, { status: newStatus });
      toast({
        title: newStatus === 'ACTIVE' ? 'Nível ativado' : 'Nível desativado',
        variant: 'success',
      });
      loadData();
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
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
    const newOrder = [...levels];
    const fromIdx = newOrder.findIndex(l => l.id === draggedId);
    const toIdx = newOrder.findIndex(l => l.id === targetId);
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setLevels(newOrder);
    setDraggedId(null);
    try {
      await api.patch('/levels/reorder', { ids: newOrder.map(l => l.id) });
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
              { label: examName || '...', href: `/dashboard/admin/exams/${examId}/topics` },
              { label: 'Tópicos', href: `/dashboard/admin/exams/${examId}/topics` },
              { label: topicName || '...', href: '#' },
              { label: 'Níveis' }
            ]}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Níveis</h1>
            <p className="text-gray-500 mt-1">Dificuldades para o tópico {topicName}.</p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Nível
        </Button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar níveis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : filteredLevels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <BarChart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchTerm ? 'Nenhum nível encontrado' : 'Nenhum nível cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            {searchTerm
              ? `Não encontramos nenhum nível com o termo "${searchTerm}".`
              : 'Crie níveis de dificuldade para organizar as questões.'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreate}>
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeiro Nível
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLevels.map((level) => (
            <div
              key={level.id}
              draggable
              onDragStart={() => handleDragStart(level.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(level.id)}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col justify-between group ${draggedId === level.id ? 'opacity-40 scale-95' : ''
                }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${level.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                      }`}>
                      {level.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GripVertical className="h-4 w-4 text-gray-300 cursor-grab active:cursor-grabbing mr-1" />
                    <button
                      onClick={() => handleToggleStatus(level)}
                      className={`p-1.5 rounded-md transition-colors ${level.status === 'ACTIVE'
                        ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                        : 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                      title={level.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                    >
                      {level.status === 'ACTIVE' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(level.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(level)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{level.name}</h3>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">XP:</span>
                    <span className="font-medium text-gray-900">{level.xpReward} XP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Aprovação Mínima:</span>
                    <span className="font-medium text-gray-900">{level.passingPercentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Questões:</span>
                    <span className="font-medium text-gray-900">{level._count?.questions || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/dashboard/admin/levels/${level.id}/questions`)}
                  className="w-full text-primary-600 border-primary-200 hover:bg-primary-50"
                >
                  Gerenciar Questões <ChevronRight className="h-4 w-4 ml-1" />
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
        title={editingLevelId ? 'Editar Nível' : 'Novo Nível'}
      >
        <LevelFormContent
          topicId={topicId}
          levelId={editingLevelId}
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
                Isso excluirá permanentemente o nível
                <span className="font-bold text-gray-900"> {levelToDelete?.name} </span>
                e todas as suas questões.
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
              Excluir Nível
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
