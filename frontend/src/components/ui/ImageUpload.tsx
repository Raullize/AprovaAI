import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import api from '@/services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const BACKEND_URL = 'http://localhost:3001';

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files && files[0]) handleFile(files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) handleFile(files[0]);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(response.data.url);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value && value.startsWith('/uploads/')) {
      const filename = value.split('/').pop();
      if (filename) {
        try {
          await api.delete(`/upload/${filename}`);
        } catch (error) {
          console.error('Erro ao remover arquivo:', error);
        }
      }
    }
    onRemove();
  };

  const normalizedValue = value?.startsWith('/') ? value : `/${value}`;
  const previewUrl = value?.includes('uploads/')
    ? `${BACKEND_URL}${normalizedValue}`
    : value;

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (value) {
      setHasError(false);
    }
  }, [value]);

  if (value) {
    return (
      <div className="relative group w-full max-w-md">
        <div className="relative w-full h-48 rounded-lg border border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
          {!hasError ? (
            <img
              src={previewUrl}
              alt="Imagem da questão"
              className="w-full h-full object-contain"
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <ImageIcon className="h-10 w-10 mb-2" />
              <span className="text-sm">Erro ao carregar a imagem</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="flex items-center gap-1 bg-white text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
        dragActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-gray-400 bg-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      <div className="text-center">
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            <p className="text-sm text-gray-600">Fazendo upload...</p>
          </div>
        ) : (
          <>
            <ImageIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              <span className="font-medium text-primary-600">
                Clique para fazer upload
              </span>
              {' ou arraste e solte'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF, WebP até 5MB
            </p>
          </>
        )}
      </div>
      {isUploading && <div className="absolute inset-0 rounded-lg" />}
    </div>
  );
}
