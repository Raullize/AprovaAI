import { Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import type { Achievement } from '../../mocks/achievements.mock';

interface AchievementsSnippetProps {
  achievements: Achievement[];
  onViewAll: () => void;
}

export function AchievementsSnippet({
  achievements,
  onViewAll,
}: AchievementsSnippetProps) {
  return (
    <Card padding="large">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 text-base font-display">
            Mural de Conquistas (Recentes)
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-650 hover:text-indigo-750 hover:underline"
        >
          Ver todas &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {achievements.slice(0, 3).map((item) => {
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
    </Card>
  );
}
