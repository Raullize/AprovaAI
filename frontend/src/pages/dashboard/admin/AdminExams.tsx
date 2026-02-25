import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronRight, BookOpen, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import Breadcrumb from '@/components/ui/Breadcrumb';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';

interface Exam {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  _count?: {
    topics: number;
  };
}

// Componente Wrapper para adaptar o ExamForm ao Modal
interface ExamFormProps {
  examId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ExamFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

function ExamFormContent({ examId, onSuccess, onCancel }: ExamFormProps) {
  const isEditing = !!examId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado específico para salvamento
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ExamFormData>({
    defaultValues: { status: 'ACTIVE' }
  });

  useEffect(() => {
    if (isEditing) {
      loadExam();
    }
  }, [examId]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/exams/${examId}`);
      const { name, description, status } = response.data;
      setValue('name', name);
      setValue('description', description || '');
      setValue('status', status);
    } catch (error) {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ExamFormData) => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await api.patch(`/exams/${examId}`, data);
        toast({ title: "Exame atualizado!", variant: "success" });
      } else {
        await api.post('/exams', data);
        toast({ title: "Exame criado!", variant: "success" });
      }
      onSuccess();
    } catch (error) {
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
        label="Nome do Exame"
        placeholder="Ex: ENEM"
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          {...register('status')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
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

export default function AdminExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/exams');
      setExams(response.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar exames",
        description: "Não foi possível buscar a lista de exames.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExamId(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingExamId(id);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (exam: Exam) => {
    try {
      const newStatus = exam.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/exams/${exam.id}`, { status: newStatus });
      toast({
        title: `Exame ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'}`,
        variant: "success"
      });
      loadExams(); // Recarrega para atualizar a UI
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (exam: Exam) => {
    setExamToDelete(exam);
    setDeleteConfirmation(''); // Resetar input
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!examToDelete) return;

    try {
      await api.delete(`/exams/${examToDelete.id}`);
      toast({
        title: "Exame excluído",
        variant: "success"
      });
      loadExams();
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    loadExams();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-4"> {/* Aumentado espaçamento vertical aqui */}
          <Breadcrumb 
            items={[
              { label: 'Exames' }
            ]} 
          />
          <div> {/* Container para agrupar título e descrição */}
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Exames</h1>
            <p className="text-gray-500 mt-1">Gerencie os exames disponíveis na plataforma.</p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Exame
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum exame encontrado</h3>
          <p className="text-gray-500 mt-2">Comece criando o primeiro exame da plataforma.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    exam.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {exam.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </div>
                  <div className="flex space-x-1 opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleStatus(exam)}
                      className={`p-1.5 rounded-md transition-colors ${
                        exam.status === 'ACTIVE' 
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={exam.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                    >
                      {exam.status === 'ACTIVE' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => handleEdit(exam.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(exam)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                  {exam.description || 'Sem descrição.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {exam._count?.topics || 0} Tópicos
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/dashboard/admin/exams/${exam.id}/topics`)}
                  className="text-primary-600 border-primary-200 hover:bg-primary-50"
                >
                  Ver Tópicos <ChevronRight className="h-4 w-4 ml-1" />
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
        title={editingExamId ? 'Editar Exame' : 'Novo Exame'}
      >
         <ExamFormContent 
           examId={editingExamId} 
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
                Essa ação não pode ser desfeita. Isso excluirá permanentemente o exame 
                <span className="font-bold text-gray-900"> {examToDelete?.name} </span>
                e removerá todos os dados associados de nossos servidores.
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
              placeholder=""
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
              Excluir Exame
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}