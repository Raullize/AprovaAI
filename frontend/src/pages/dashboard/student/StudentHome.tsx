import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Compass } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome text */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            Olá, {user?.fullName?.split(' ')[0] || user?.username || 'Estudante'}!
          </h1>
          <p className="text-slate-500 mt-1">Pronto para bater sua meta diária?</p>
        </div>

        {/* Continue Learning */}
        {RECENT_EXAMS.length > 0 ? (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-indigo-500" />
              Continue de onde parou
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {RECENT_EXAMS.map((exam) => {
                const iconOpt  = getIconOption(exam.iconKey);
                const colorOpt = getColorOption(exam.colorScheme);
                const Icon = iconOpt.Icon;
                return (
                  <button
                    key={exam.id}
                    onClick={() => navigate(`/dashboard/explore/${exam.id}`)}
                    className="group text-left bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner", colorOpt.gradient)}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate text-lg group-hover:text-indigo-600 transition-colors">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5 truncate">
                          Próximo: <span className="font-medium text-slate-700">{exam.lastTopic}</span>
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full bg-gradient-to-r", colorOpt.gradient)}
                              style={{ width: `${exam.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-400 w-8">{exam.progress}%</span>
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
          <div className="mb-10 bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Você ainda não iniciou nenhum exame</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Explore o catálogo e encontre a certificação ou concurso perfeito para você.</p>
            <button
              onClick={() => navigate('/dashboard/explore')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Compass className="h-5 w-5" />
              Explorar Catálogo
            </button>
          </div>
        )}

        {/* Explore CTA */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-indigo-900 mb-1">Quer começar algo novo?</h3>
            <p className="text-indigo-700/80 text-sm">Explore nosso catálogo com dezenas de exames e certificações.</p>
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
