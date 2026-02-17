'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Portal from '@/components/ui/Portal';
import Loading from '@/components/ui/Loading';
import { Topic } from '@/types';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topic: Topic) => void;
  topic?: Topic | null;
  examId: string;
}

import { createTopic, updateTopic } from '@/actions/topics';

export default function TopicModal({ isOpen, onClose, onSave, topic, examId }: TopicModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (topic) {
        setFormData({
          name: topic.name,
          description: topic.description || '',
          status: topic.status,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'ACTIVE',
        });
      }
      setErrors({});
    }
  }, [isOpen, topic]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, loading, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let savedTopic;
      
      if (topic) {
        savedTopic = await updateTopic({
          id: topic.id,
          name: formData.name,
          description: formData.description,
          status: formData.status,
        });
      } else {
        savedTopic = await createTopic({
          name: formData.name,
          description: formData.description,
          examId,
        });
      }

      onSave(savedTopic);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tópico:', error);
      
      // Tratamento simplificado de erro, idealmente poderíamos parsear erros do Zod se viessem estruturados
      // mas como o server action lança Error genérico para validações simples
      setErrors({ 
        general: error instanceof Error ? error.message : 'Erro ao salvar tópico' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
        onClick={handleBackdropClick}
      >
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {topic ? 'Editar Tópico' : 'Novo Tópico'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div>
            <Input
              label="Nome *"
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Matemática"
              disabled={loading}
              error={errors.name}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição opcional do tópico..."
              disabled={loading}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.status ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
              }`}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {loading && <Loading size="xs" />}
              {topic ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
