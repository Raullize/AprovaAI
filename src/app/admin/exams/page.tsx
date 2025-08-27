'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import ExamModal from '@/components/admin/ExamModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Exam } from '@/types';

const statusLabels = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo'
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-red-100 text-red-800'
};

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExamSaved = (savedExam: Exam) => {
    if (editingExam) {
      // Atualizar exame existente
      setExams(exams.map(exam => 
        exam.id === savedExam.id ? savedExam : exam
      ));
    } else {
      // Adicionar novo exame
      setExams([savedExam, ...exams]);
    }
  };

  const handleStatusChange = async (examId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setExams(exams.map(exam => 
          exam.id === examId ? { ...exam, status: newStatus } : exam
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteExam = (exam: Exam) => {
    setExamToDelete(exam);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/exams/${examToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchExams();
        setExamToDelete(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao excluir exame');
      }
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <span className="text-sm font-medium text-gray-500">
              Exames
            </span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Exames</h1>
          <p className="text-gray-600 mt-1">
            Crie e gerencie exames, tópicos e níveis para os simulados
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Exame
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar exames..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum exame encontrado' : 'Nenhum exame cadastrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando seu primeiro exame'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Exame
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[exam.status]
                }`}>
                  {statusLabels[exam.status]}
                </span>
                <div className="flex items-center gap-1">
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleStatusChange(
                      exam.id, 
                      exam.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                    )}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={exam.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                  >
                    {exam.status === 'ACTIVE' ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingExam(exam)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteExam(exam)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Exam Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {exam.name}
              </h3>
              {exam.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {exam.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{exam._count?.topics || 0} tópicos</span>
                <span>
                  Criado em {new Date(exam.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Manage Topics Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    router.push(`/admin/exams/${exam.slug}/topics`);
                  }}
                >
                  Gerenciar Tópicos
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <ExamModal
        isOpen={showCreateModal || !!editingExam}
        onClose={() => {
          setShowCreateModal(false);
          setEditingExam(null);
        }}
        onSave={handleExamSaved}
        exam={editingExam}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        onConfirm={confirmDeleteExam}
        title="Excluir Exame"
        message={`Tem certeza que deseja excluir o exame "${examToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}