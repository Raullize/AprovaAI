import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import { achievements } from '../../../mocks/achievements.mock';

export default function Achievements() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Perfil
          </button>
          <h2 className="text-xl font-bold text-slate-800 font-display">
            Minhas Conquistas
          </h2>
        </div>

        {/* Introduction Banner Card */}
        <Card
          padding="large"
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/10 border-0 overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 translate-y-24 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold font-display leading-tight">
                Mural de Conquistas
              </h1>
              <p className="text-indigo-100 text-sm mt-2 max-w-xl">
                Desbloqueie conquistas respondendo questões, completando
                simulados e mantendo sua ofensiva de estudos ativa! Acompanhe
                seu progresso abaixo.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-white/10 backdrop-blur-md px-5 py-4 rounded-3xl border border-white/10">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">
                  Progresso
                </p>
                <p className="text-2xl font-black font-display text-white">
                  {achievements.filter((a) => a.isUnlocked).length} /{' '}
                  {achievements.length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {achievements.map((item) => {
            const IconComp = item.icon;
            return (
              <Card
                key={item.id}
                padding="large"
                className={cn(
                  'transition-all relative border flex flex-col justify-between h-48',
                  item.isUnlocked
                    ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer duration-300'
                    : 'bg-slate-50/50 border-slate-100 opacity-60',
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300',
                        item.isUnlocked
                          ? 'scale-100 hover:scale-110'
                          : 'scale-95',
                        item.color,
                      )}
                    >
                      <IconComp className="h-6 w-6" />
                    </div>

                    {item.isUnlocked ? (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        Desbloqueada
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        Bloqueada
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4
                      className={cn(
                        'font-bold text-base leading-tight font-display',
                        item.isUnlocked ? 'text-slate-800' : 'text-slate-500',
                      )}
                    >
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
