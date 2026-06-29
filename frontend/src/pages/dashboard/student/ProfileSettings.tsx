import { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  ArrowLeft,
  Camera,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { accountService } from '../../../services/account.service';
import { cn } from '../../../lib/utils';
import UserAvatar from '../../../components/ui/UserAvatar';
import Modal from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';

export default function ProfileSettings() {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for settings
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  // Avatar existence state
  const [hasAvatar, setHasAvatar] = useState(() => {
    if (user?.id) {
      return !!localStorage.getItem(`@aprovaai:avatarUrl:${user.id}`);
    }
    return false;
  });

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.id) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem(`@aprovaai:avatarUrl:${user.id}`, base64String);
        window.dispatchEvent(new Event('avatar-update'));
        setHasAvatar(true);
        toast.success('Foto de perfil atualizada!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    if (user?.id) {
      localStorage.removeItem(`@aprovaai:avatarUrl:${user.id}`);
      window.dispatchEvent(new Event('avatar-update'));
      setHasAvatar(false);
      toast.success('Foto de perfil removida!');
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await accountService.updateProfile({ fullName, email, username });
      await refreshUser();
      toast.success('Configurações atualizadas com sucesso!');
      navigate('/dashboard/profile');
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
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao atualizar senha.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await accountService.deleteAccount();
      setShowDeleteModal(false);
      toast.success('Conta excluída com sucesso.');
      signOut();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao excluir conta.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // Helper for password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd)
      return {
        score: 0,
        label: '',
        color: 'bg-slate-200',
        textColor: 'text-slate-400',
        width: 'w-0',
      };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2)
      return {
        score,
        label: 'Fraca',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        width: 'w-1/3',
      };
    if (score <= 4)
      return {
        score,
        label: 'Média',
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
        width: 'w-2/3',
      };
    return {
      score,
      label: 'Forte',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      width: 'w-full',
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Perfil
          </button>
          <h2 className="text-xl font-bold text-slate-800 font-display">
            Editar Conta
          </h2>
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
            <UserAvatar size="xl" />
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
              Foto de Perfil
            </h3>
            <p className="text-slate-400 text-xs mt-1 leading-normal max-w-xs">
              Carregue uma imagem em formato JPG ou PNG de até 2MB. Ela
              ficará visível no header e sidebar.
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

        {/* Danger Zone */}
        <Card
          padding="large"
          className="bg-rose-50/50 border-rose-100 space-y-4"
        >
          <div>
            <h3 className="font-bold text-rose-800 text-base font-display flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-500" />
              Zona de Perigo
            </h3>
            <p className="text-rose-700/80 text-xs mt-1 leading-normal max-w-md">
              A exclusão de conta é permanente. Todos os seus dados,
              históricos de simulados e XP acumulado serão perdidos para
              sempre.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmation('');
              setShowDeleteModal(true);
            }}
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all text-sm flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/10"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Minha Conta
          </button>
        </Card>
      </div>

      {/* Delete account confirmation modal (Requires typed confirmation) */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão de Conta"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-500 text-sm leading-relaxed">
            Tem certeza de que deseja excluir sua conta? Esta ação{' '}
            <span className="font-bold text-red-600">
              não pode ser desfeita
            </span>
            .
          </p>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Digite{' '}
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded select-all">
                excluir conta
              </span>{' '}
              para confirmar:
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-400 bg-white"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="excluir conta"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
            >
              CANCELAR
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation.toLowerCase() !== 'excluir conta'}
              className="flex-1 py-3 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              EXCLUIR CONTA
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
