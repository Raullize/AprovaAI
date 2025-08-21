'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Link, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import ImageUpload from '@/components/ui/ImageUpload';
import Portal from '@/components/ui/Portal';

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
  questionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Question {
  id: string;
  content: string;
  imageUrl?: string;
  explanation?: string;
  studyLink?: string;
  order: number;
  levelId?: string;
  options: Option[];
  createdAt: string;
  updatedAt: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  question?: Question | null;
  levelId: string;
}

export default function QuestionModal({
  isOpen,
  onClose,
  onSave,
  question,
  levelId
}: QuestionModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    content: '',
    imageUrl: '',
    explanation: '',
    studyLink: '',
    options: [
      { text: '', isCorrect: false, order: 1 },
      { text: '', isCorrect: false, order: 2 }
    ] as Option[]
  });

  useEffect(() => {
    if (isOpen) {
      if (question) {
        // Editando questão existente
        setFormData({
          content: question.content,
          imageUrl: question.imageUrl || '',
          explanation: question.explanation || '',
          studyLink: question.studyLink || '',
          options: question.options?.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: opt.order
          })) || [
            { text: '', isCorrect: false, order: 1 },
            { text: '', isCorrect: false, order: 2 }
          ]
        });
      } else {
        // Nova questão
        setFormData({
          content: '',
          imageUrl: '',
          explanation: '',
          studyLink: '',
          options: [
            { text: '', isCorrect: false, order: 1 },
            { text: '', isCorrect: false, order: 2 }
          ]
        });
      }
      setErrors({});
    }
  }, [isOpen, question]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
    
    if (errors[`option_${index}`]) {
      setErrors(prev => ({ ...prev, [`option_${index}`]: '' }));
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { text: '', isCorrect: false, order: prev.options.length + 1 }
      ]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      alert('Uma questão deve ter pelo menos 2 alternativas.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index).map((opt, i) => ({
        ...opt,
        order: i + 1
      }))
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo da questão é obrigatório';
    }

    // Validar URL da imagem se fornecida
    if (formData.imageUrl && formData.imageUrl.trim()) {
      const imageUrl = formData.imageUrl.trim();
      // Aceitar URLs relativas (começando com /) ou URLs completas
      if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        try {
          new URL(imageUrl);
        } catch {
          newErrors.imageUrl = 'URL da imagem inválida';
        }
      }
    }

    // Validar alternativas
    let hasCorrectOption = false;
    formData.options.forEach((option, index) => {
      if (!option.text.trim()) {
        newErrors[`option_${index}`] = 'Texto da alternativa é obrigatório';
      }
      if (option.isCorrect) {
        hasCorrectOption = true;
      }
    });

    if (!hasCorrectOption) {
      newErrors.options = 'Pelo menos uma alternativa deve estar marcada como correta';
    }

    // Validar URL se fornecida
    if (formData.studyLink && formData.studyLink.trim()) {
      try {
        new URL(formData.studyLink);
      } catch {
        newErrors.studyLink = 'URL inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const url = question 
        ? `/api/admin/questions/${question.id}`
        : '/api/admin/questions';
      
      const method = question ? 'PATCH' : 'POST';
      
      const payload = {
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        explanation: formData.explanation.trim() || undefined,
        studyLink: formData.studyLink.trim() || undefined,
        levelId,
        options: formData.options.map((opt, index) => ({
          text: opt.text.trim(),
          isCorrect: opt.isCorrect,
          order: index + 1
        }))
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedQuestion = await response.json();
        onSave(savedQuestion);
        onClose();
      } else {
        const data = await response.json();
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert(data.error || 'Erro ao salvar questão');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar questão:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Editar Questão' : 'Nova Questão'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Imagem da Questão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem da Questão (opcional)
              </label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => handleInputChange('imageUrl', url)}
                onRemove={() => handleInputChange('imageUrl', '')}
                disabled={loading}
              />
              {errors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
              )}
            </div>

            {/* Conteúdo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo da Questão *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Digite o enunciado da questão..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* Alternativas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Alternativas *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              
              {errors.options && (
                <p className="mb-3 text-sm text-red-600">{errors.options}</p>
              )}
              
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">Correta</span>
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors[`option_${index}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                      />
                      {errors[`option_${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`option_${index}`]}</p>
                      )}
                    </div>
                    
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors mt-1"
                        title="Remover alternativa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Explicação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <HelpCircle className="inline h-4 w-4 mr-1" />
                Explicação (Opcional)
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Explique por que esta é a resposta correta..."
              />
            </div>

            {/* Link de Estudo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="inline h-4 w-4 mr-1" />
                Link de Aprofundamento (Opcional)
              </label>
              <input
                type="url"
                value={formData.studyLink}
                onChange={(e) => handleInputChange('studyLink', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.studyLink ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://exemplo.com/material-de-estudo"
              />
              {errors.studyLink && (
                <p className="mt-1 text-sm text-red-600">{errors.studyLink}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Link para material complementar sobre o tópico da questão
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loading size="xs" />}
            {question ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </div>
    </div>
    </Portal>
  );
}