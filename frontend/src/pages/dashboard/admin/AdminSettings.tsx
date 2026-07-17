import { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Camera,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { accountService } from '../../../services/account.service';
import { cn } from '../../../lib/utils';
import UserAvatar from '../../../components/ui/UserAvatar';
import { Card } from '../../../components/ui/Card';
import { calculatePasswordStrength } from '../../../utils/password.utils';
import api from '../../../services/api';

export default function AdminSettings() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [hasAvatar, setHasAvatar] = useState(!!user?.avatarUrl);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.id) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB.');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      try {
        setIsSaving(true);
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadedUrl = response.data.url;
        setAvatarUrl(uploadedUrl);
        setHasAvatar(true);
        toast.success('Foto carregada! Clique em Salvar para aplicar.');
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        toast.error('Erro ao fazer upload da imagem.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setHasAvatar(false);
    toast.success('Foto removida! Clique em Salvar para aplicar.');
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await accountService.updateProfile({ fullName, email, username, avatarUrl });
      await refreshUser();
      toast.success('Configurações atualizadas com sucesso!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao salvar configurações.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }
    try {
      await accountService.updatePassword({ currentPassword, newPassword });
      toast.success('Senha atualizada com sucesso!');
      setCurrentPassword('');
      newPassword && setNewPassword('');
      confirmPassword && setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao atualizar senha.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const strengthResult = calculatePasswordStrength(newPassword);
  const passwordStrength = {
    score: strengthResult.score,
    label: strengthResult.label,
    color: strengthResult.color,
    textColor: strengthResult.color ? strengthResult.color.replace('bg-', 'text-') : 'text-slate-400',
    width: strengthResult.score === 0
      ? 'w-0'
      : strengthResult.score <= 3
        ? 'w-1/3'
        : strengthResult.score <= 5
          ? 'w-2/3'
          : 'w-full',
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">
            Configurações da Conta
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie suas informações cadastrais e credenciais de acesso do administrador.
          </p>
        </div>

        {/* Profile image change and removal option */}
        <Card
          padding="large"
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
          >
            <UserAvatar size="xl" userOverride={user ? { ...user, avatarUrl } : undefined} />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="h-6 w-6" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-slate-700 text-base">
              Foto de Perfil do Administrador
            </h3>
            <p className="text-slate-400 text-xs mt-1 leading-normal max-w-xs">
              Carregue uma imagem em formato JPG ou PNG de até 2MB. Ela
              ficará visível no header e sidebar da dashboard.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
              <button
                onClick={handleAvatarClick}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-650 hover:text-indigo-750 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-all border border-indigo-100"
              >
                <Camera className="h-3.5 w-3.5" />
                Alterar Imagem
              </button>
              {hasAvatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-650 hover:text-red-750 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-all border border-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover Imagem
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Form edit personal info */}
        <Card padding="large">
          <h3 className="font-bold text-slate-855 text-base mb-4 font-display">
            Dados Cadastrais
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-800 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nome de Usuário
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome de usuário único"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-800 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Endereço de E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-800 text-sm font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md shadow-indigo-600/10"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </Card>

        {/* Change Password Panel */}
        <Card padding="large">
          <h3 className="font-bold text-slate-855 text-base mb-4 font-display">
            Alterar Senha
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-800 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-650 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-650 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          passwordStrength.color,
                          passwordStrength.width,
                        )}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">
                      Força da senha:{' '}
                      <span
                        className={cn(
                          'font-extrabold',
                          passwordStrength.textColor,
                        )}
                      >
                        {passwordStrength.label}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-650 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md shadow-indigo-600/10"
              >
                Atualizar Senha
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
