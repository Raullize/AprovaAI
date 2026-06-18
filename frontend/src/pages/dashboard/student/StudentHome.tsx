import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  Compass,
  Flame,
  Award,
  Zap,
  History,
  Trophy,
  Lock,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getIconOption, getColorOption } from '../../../config/examThemes';

const RECENT_EXAMS = [
  {
    id: 'aws-cpp',
    title: 'AWS Cloud Practitioner',
    progress: 30,
    lastTopic: 'Conceitos de Nuvem',
    iconKey: 'cpu',
    colorScheme: 'orange',
  },
  {
    id: 'oab',
    title: 'Exame da Ordem (OAB)',
    progress: 45,
    lastTopic: 'Direito Constitucional',
    iconKey: 'trophy',
    colorScheme: 'sky',
  },
];

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalXP = user?.xp || 320;
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpNeededForNextLevel = 100 - (totalXP % 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome text */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            Olá,{' '}
            {user?.fullName?.split(' ')[0] || user?.username || 'Estudante'}!
          </h1>
          <p className="text-slate-500 mt-1">
            Pronto para bater sua meta diária de estudos?
          </p>
        </div>

        {/* Metas e Gamificação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-3xl border border-orange-100/70 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                <Flame className="h-6 w-6 text-white fill-current animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-orange-700/80 font-bold uppercase tracking-wider">
                  Ofensiva
                </p>
                <p className="text-2xl font-black text-orange-950 font-display">
                  5 dias
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-1">
              {[false, true, true, true, true, true, false].map((active, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-7 h-7 sm:w-8 sm:h-8 rounded-lg',
                      active
                        ? 'bg-orange-500 shadow-sm shadow-orange-500/20'
                        : 'bg-orange-200/50',
                    )}
                  />
                  <span className="text-[10px] font-bold text-orange-800/40">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* XP Total Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-indigo-600 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  XP Total
                </p>
                <p className="font-bold text-slate-700 text-sm">{totalXP} XP</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${totalXP % 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Faltam {xpNeededForNextLevel} XP para o Nível {currentLevel + 1}
              </p>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Aproveitamento
                </p>
                <p className="font-bold text-slate-700 text-sm">
                  82% de acertos
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: '82%' }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Mapeado das últimas 50 questões
              </p>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-500" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Quick Simulation */}
          <div className="group text-left p-5 bg-white rounded-3xl border border-slate-200 flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 text-indigo-500">
              <Zap className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Simulado Expresso
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Gere um teste rápido de 10 questões aleatórias baseadas nos
                tópicos da sua trilha.
              </p>
            </div>
          </div>

          {/* Spaced Repetition/Incorrect questions review */}
          <button
            onClick={() => navigate('/dashboard/simulations')}
            className="group text-left p-5 bg-white rounded-3xl border border-slate-200 hover:border-rose-300 hover:shadow-md hover:shadow-rose-500/5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 text-rose-500 group-hover:scale-110 transition-transform">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base group-hover:text-rose-650 transition-colors">
                Histórico de Simulados
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Acesse o histórico completo de tentativas e confira seu
                progresso nos simulados realizados.
              </p>
            </div>
          </button>
        </div>

        {/* Continue Learning */}
        {RECENT_EXAMS.length > 0 ? (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-indigo-500" />
              Continue de onde parou
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {RECENT_EXAMS.map((exam) => {
                const iconOpt = getIconOption(exam.iconKey);
                const colorOpt = getColorOption(exam.colorScheme);
                const Icon = iconOpt.Icon;
                return (
                  <button
                    key={exam.id}
                    onClick={() => navigate(`/dashboard/explore/${exam.id}`)}
                    className="group text-left bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner',
                          colorOpt.gradient,
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate text-lg group-hover:text-indigo-600 transition-colors">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5 truncate">
                          Próximo:{' '}
                          <span className="font-medium text-slate-700">
                            {exam.lastTopic}
                          </span>
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full bg-gradient-to-r',
                                colorOpt.gradient,
                              )}
                              style={{ width: `${exam.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-400 w-8">
                            {exam.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="mb-8 bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Você ainda não iniciou nenhum exame
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Explore o catálogo e encontre a certificação ou concurso perfeito
              para você.
            </p>
            <button
              onClick={() => navigate('/dashboard/explore')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Compass className="h-5 w-5" />
              Explorar Catálogo
            </button>
          </div>
        )}

        {/* Conquistas Recentes */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500" />
            Suas Conquistas
          </h2>
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            Ver todas &rarr;
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">
                Primeiros Passos
              </p>
              <p className="text-[10px] text-slate-400">
                Iniciou a primeira trilha
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">Foco Total</p>
              <p className="text-[10px] text-slate-400">
                Estudou 3 dias seguidos
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 opacity-50 relative group">
            <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">
                Mestre de Nuvem
              </p>
              <p className="text-[10px] text-slate-400">Resolva 100 questões</p>
            </div>
          </div>
        </div>

        {/* Explore CTA */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-indigo-900 mb-1">
              Quer começar algo novo?
            </h3>
            <p className="text-indigo-700/80 text-sm">
              Explore nosso catálogo com dezenas de exames e certificações.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/explore')}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
          >
            <Compass className="h-5 w-5" />
            Explorar Catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
