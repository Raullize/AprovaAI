'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Portal from '@/components/ui/Portal';
import Loading from '@/components/ui/Loading';
import { Level } from '@/types';

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (level: Level) => void;
  level?: Level | null;
  topicId: string;
}

export default function LevelModal({ isOpen, onClose, onSave, level, topicId }: LevelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    xpReward: 0,
    passingPercentage: 70,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (level) {
        setFormData({
          name: level.name,
          description: level.description || '',
          xpReward: level.xpReward,
          passingPercentage: level.passingPercentage,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          xpReward: 0,
          passingPercentage: 70,
        });
      }
      setErrors({});
    }
  }, [isOpen, level]);

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
      const url = level 
        ? `/api/admin/levels/${level.id}`
        : '/api/admin/levels';
      
      const method = level ? 'PATCH' : 'POST';
      
      const payload = level 
        ? formData
        : { ...formData, topicId };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onSave(data);
        onClose();
      } else {
        if (data.details) {
          // Erros de validação do Zod
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              fieldErrors[error.path[0]] = error.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || 'Erro ao salvar nível' });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar nível:', error);
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue: any = value;
    
    if (field === 'xpReward') {
      processedValue = parseInt(value) || 0;
    } else if (field === 'passingPercentage') {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
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
            {level ? 'Editar Nível' : 'Novo Nível'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Básico"
              disabled={loading}
              className={errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="xpReward" className="block text-sm font-medium text-gray-700 mb-1">
              XP de Recompensa *
            </label>
            <Input
              id="xpReward"
              type="number"
              min="0"
              value={formData.xpReward.toString()}
              onChange={(e) => handleInputChange('xpReward', e.target.value)}
              placeholder="100"
              disabled={loading}
              className={errors.xpReward ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            />
            {errors.xpReward && (
              <p className="mt-1 text-sm text-red-600">{errors.xpReward}</p>
            )}
          </div>

          <div>
            <label htmlFor="passingPercentage" className="block text-sm font-medium text-gray-700 mb-1">
              Porcentagem para Passar (%) *
            </label>
            <Input
              id="passingPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.passingPercentage.toString()}
              onChange={(e) => handleInputChange('passingPercentage', e.target.value)}
              placeholder="70"
              disabled={loading}
              className={errors.passingPercentage ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            />
            {errors.passingPercentage && (
              <p className="mt-1 text-sm text-red-600">{errors.passingPercentage}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição opcional do nível..."
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
              {level ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}