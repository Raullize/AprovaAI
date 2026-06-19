import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import {
  Trophy,
  Zap,
  Shield,
  Target,
  Clock,
  Compass,
  Settings as SettingsIcon,
  ArrowLeft,
  Key,
  Trash2,
  Camera,
  Award,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';

import { cn } from '../../../lib/utils';
import { toast } from 'sonner';
import UserAvatar from '../../../components/ui/UserAvatar';
import Modal from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { IconBox } from '../../../components/ui/IconBox';
import api from '../../../services/api';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isUnlocked: boolean;
}

interface LeaderboardUser {
  rank: number;
  fullName: string;
  username: string;
  xp: number;
  isCurrentUser?: boolean;
}

export default function Profile() {
  const { user, signOut, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : 'Estudante';

  // Generate days for the current month calendar
  const getMonthCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: ({ dateNum: number } | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ dateNum: i });
    }

    const monthName = now.toLocaleString('pt-BR', { month: 'long' });
    const capitalizedMonth =
      monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return {
      days,
      monthName: capitalizedMonth,
      currentDay: now.getDate(),
    };
  };

  const {
    days: monthDays,
    monthName: currentMonthName,
    currentDay,
  } = getMonthCalendar();

  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState(user?.streakCount || 0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsRes, lbRes, historyRes] = await Promise.all([
          api.get('/student/dashboard-stats'),
          api.get('/student/leaderboard'),
          api.get('/simulations/history'),
        ]);
        if (statsRes.data) {
          setActiveDays(statsRes.data.activeDays);
          setStreakCount(statsRes.data.streakCount);
        }
        if (lbRes.data) {
          setLeaderboard(lbRes.data);
        }
        if (historyRes.data) {
          setHistory(historyRes.data);
        }
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    }
    loadStats();
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'achievements' | 'ranking'>(
    'achievements',
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setShowSettings(searchParams.get('settings') === 'true');
  }, [searchParams]);

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

  // Delete account verification
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const totalXP = user?.xp || 0;
  const currentLevel = Math.floor(totalXP / 100);
  const xpNeededForNextLevel = 100 - (totalXP % 100 || 0);

  const completedAttempts = history.filter((h) => h.status === 'COMPLETED');
  const totalCorrect = completedAttempts.reduce((sum, h) => sum + (h.score || 0), 0);
  const totalQuest = completedAttempts.reduce((sum, h) => sum + (h.totalQuestions || 0), 0);
  const accuracy = totalQuest > 0 ? Math.round((totalCorrect / totalQuest) * 100) : 0;

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch('/account/profile', {
        fullName,
        email,
        username,
      });
      await refreshUser();
      toast.success('Configurações atualizadas com sucesso!');
      setShowSettings(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao salvar configurações.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }
    try {
      await api.patch('/account/password', {
        currentPassword,
        newPassword,
      });
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
      await api.delete('/account');
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

  const achievements: Achievement[] = [
    {
      id: 'a1',
      title: 'Primeiros Passos',
      description: 'Iniciou a primeira trilha de estudos',
      icon: Trophy,
      color: 'bg-amber-500 text-white',
      isUnlocked: true,
    },
    {
      id: 'a2',
      title: 'Foco Total',
      description: 'Estudou por 3 dias seguidos',
      icon: Zap,
      color: 'bg-indigo-500 text-white',
      isUnlocked: true,
    },
    {
      id: 'a3',
      title: 'Mestre de Nuvem',
      description: 'Resolva 100 questões de Nuvem',
      icon: Shield,
      color: 'bg-slate-300 text-slate-500',
      isUnlocked: false,
    },
    {
      id: 'a4',
      title: 'Mira Certeira',
      description: 'Acerte 10 questões seguidas',
      icon: Target,
      color: 'bg-slate-300 text-slate-500',
      isUnlocked: false,
    },
    {
      id: 'a5',
      title: 'Maratonista',
      description: 'Estude por mais de 5 horas',
      icon: Clock,
      color: 'bg-slate-300 text-slate-500',
      isUnlocked: false,
    },
    {
      id: 'a6',
      title: 'Desbravador',
      description: 'Conclua todos os tópicos de um exame',
      icon: Compass,
      color: 'bg-slate-300 text-slate-500',
      isUnlocked: false,
    },
  ];

  // Sort leaderboard by XP
  const sortedLeaderboard = leaderboard.map((item) => ({
    ...item,
    isCurrentUser: item.username === user?.username,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Toggle between profile view and settings view */}
        {!showSettings ? (
          <>
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-800 font-display">
                Meu Perfil
              </h1>
              <p className="text-slate-500 mt-1">
                Gerencie sua conta e acompanhe seus principais indicadores na plataforma.
              </p>
            </div>

            {/* User Profile Card */}
            <Card
              padding="large"
              className="flex flex-col sm:flex-row items-center gap-6 relative"
            >
              <button
                onClick={() => setSearchParams({ settings: 'true' })}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-50 active:scale-95 transition-all border border-slate-100"
                title="Configurações"
              >
                <SettingsIcon className="h-5 w-5" />
              </button>

              <UserAvatar size="xl" />
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-slate-800 font-display">
                  {user?.fullName || 'Usuário'}
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  @{user?.username || 'username'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-150">
                    {roleLabel}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold border border-amber-150 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 fill-current animate-pulse" />
                    Nível {currentLevel}
                  </span>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* XP Total Card */}
              <Card className="flex flex-col justify-between" padding="normal">
                <div className="flex items-center gap-3">
                  <IconBox
                    icon={<Zap className="h-5 w-5 animate-pulse" />}
                    colorScheme="indigo"
                    size="md"
                    shape="square"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      XP Total
                    </p>
                    <p className="font-bold text-slate-700 text-sm">
                      {totalXP} XP
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    progress={totalXP % 100}
                    colorScheme="indigo"
                    size="md"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Faltam {xpNeededForNextLevel} XP para o Nível{' '}
                    {currentLevel + 1}
                  </p>
                </div>
              </Card>

              {/* Accuracy Card */}
              <Card className="flex flex-col justify-between" padding="normal">
                <div className="flex items-center gap-3">
                  <IconBox
                    icon={<Award className="h-5 w-5" />}
                    colorScheme="emerald"
                    size="md"
                    shape="square"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Aproveitamento
                    </p>
                    <p className="font-bold text-slate-700 text-sm">
                      {accuracy}% de acertos
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar progress={accuracy} colorScheme="emerald" size="md" />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Mapeado de todos os seus simulados
                  </p>
                </div>
              </Card>

              <Card className="flex flex-col justify-between" padding="normal">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Plano Atual
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-2 flex items-center gap-1.5 font-display uppercase">
                    <Shield className="h-5 w-5 text-indigo-500" />
                    {user?.subscriptionPlan || 'FREE'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  {user?.subscriptionPlan === 'PREMIUM' ? 'Plano Premium' : 'Plano Gratuito'}
                </p>
              </Card>
            </div>

            {/* Monthly Streak Calendar */}
            <Card padding="large">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <IconBox
                    icon={
                      <Flame className="h-6 w-6 text-white fill-current animate-pulse" />
                    }
                    size="lg"
                    shape="square"
                    className="bg-orange-500 shadow-md shadow-orange-500/20"
                    iconClassName=""
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-base font-display">
                      Ofensiva Mensal
                    </h3>
                    <p className="text-xs text-slate-400">
                      Você estudou{' '}
                      {activeDays.filter((d) => d <= currentDay).length} dias em{' '}
                      {currentMonthName}
                    </p>
                  </div>
                </div>
                <div className="flex sm:justify-end">
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-150 rounded-xl px-3 py-1.5 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 fill-current" />{streakCount} {streakCount === 1 ? 'dia de ofensiva' : 'dias de ofensiva'}
                  </span>
                </div>
              </div>

              {/* Calendar days of the week header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
                  <div
                    key={idx}
                    className="py-1 text-[10px] uppercase tracking-wider"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid slots */}
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day, idx) => {
                  if (!day) return <div key={idx} className="aspect-square" />;
                  const isActive = activeDays.includes(day.dateNum);
                  const isCurrentDay = day.dateNum === currentDay;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative border',
                        isActive
                          ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/20'
                          : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100/50',
                        isCurrentDay &&
                          !isActive &&
                          'ring-2 ring-indigo-500 ring-offset-2',
                      )}
                      title={`${day.dateNum} de ${currentMonthName}`}
                    >
                      {day.dateNum}
                      {isCurrentDay && isActive && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Tabs for Achievements and Ranking */}
            <Card padding="none" className="overflow-hidden">
              <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2',
                    activeTab === 'achievements'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40',
                  )}
                >
                  <Award className="h-4.5 w-4.5" />
                  Mural de Conquistas
                </button>
                <button
                  onClick={() => setActiveTab('ranking')}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2',
                    activeTab === 'ranking'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40',
                  )}
                >
                  <Trophy className="h-4.5 w-4.5" />
                  Ranking Global
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'achievements' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {achievements.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'p-5 rounded-3xl border flex items-center gap-4 transition-all relative',
                            item.isUnlocked
                              ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer'
                              : 'bg-slate-50/50 border-slate-100 opacity-60',
                          )}
                        >
                          <div
                            className={cn(
                              'w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm',
                              item.color,
                            )}
                          >
                            <IconComp className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-tight">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                              {item.description}
                            </p>
                          </div>
                          {!item.isUnlocked && (
                            <span className="absolute top-3 right-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-lg">
                              Bloqueado
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Ranking View (Replaced Emojis with Trophy Icons) */
                  <div className="divide-y divide-slate-100">
                    {sortedLeaderboard.map((item) => (
                      <div
                        key={item.username}
                        className={cn(
                          'flex items-center justify-between py-4 px-3 rounded-2xl transition-colors',
                          item.isCurrentUser
                            ? 'bg-indigo-50/50 border border-indigo-100/50'
                            : 'hover:bg-slate-50',
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank indicator using Trophy icons instead of Emojis */}
                          <span
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center font-bold font-display text-sm shrink-0',
                              item.rank === 1
                                ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300/50'
                                : item.rank === 2
                                  ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-300/50'
                                  : item.rank === 3
                                    ? 'bg-orange-100 text-orange-850 ring-2 ring-orange-300/50'
                                    : 'text-slate-400',
                            )}
                          >
                            {item.rank === 1 ? (
                              <Trophy className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                            ) : item.rank === 2 ? (
                              <Trophy className="h-4.5 w-4.5 text-slate-400 fill-slate-400" />
                            ) : item.rank === 3 ? (
                              <Trophy className="h-4.5 w-4.5 text-amber-700 fill-amber-700" />
                            ) : (
                              item.rank
                            )}
                          </span>

                          {/* Avatar component */}
                          <UserAvatar
                            size="xs"
                            userOverride={
                              item.isCurrentUser
                                ? undefined
                                : {
                                    fullName: item.fullName,
                                    username: item.username,
                                  }
                            }
                          />

                          <div>
                            <span
                              className={cn(
                                'font-bold text-sm block',
                                item.isCurrentUser
                                  ? 'text-indigo-900'
                                  : 'text-slate-700',
                              )}
                            >
                              {item.fullName} {item.isCurrentUser && '(Você)'}
                            </span>
                            <span className="text-slate-400 text-xs">
                              @{item.username}
                            </span>
                          </div>
                        </div>

                        <span
                          className={cn(
                            'font-bold font-display text-sm shrink-0',
                            item.isCurrentUser
                              ? 'text-indigo-600'
                              : 'text-slate-600',
                          )}
                        >
                          {item.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : (
          /* Profile Settings Panel */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSearchParams({})}
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
              <h3 className="font-bold text-slate-850 text-base mb-4 font-display">
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
              <h3 className="font-bold text-slate-850 text-base mb-4 font-display flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-500" />
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
                      className="w-full pl-4 pr-11 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-800 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
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
        )}
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
