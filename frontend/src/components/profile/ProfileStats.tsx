import { Zap, Shield, Award } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { IconBox } from '../ui/IconBox';

interface ProfileStatsProps {
  totalXP: number;
  xpNeededForNextLevel: number;
  currentLevel: number;
  accuracy: number;
  subscriptionPlan?: string | null;
}

export function ProfileStats({
  totalXP,
  xpNeededForNextLevel,
  currentLevel,
  accuracy,
  subscriptionPlan,
}: ProfileStatsProps) {
  return (
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
            <p className="font-bold text-slate-700 text-sm">{totalXP} XP</p>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar
            progress={totalXP % 100}
            colorScheme="indigo"
            size="md"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Faltam {xpNeededForNextLevel} XP para o Simulado {currentLevel + 1}
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

      {/* Subscription Card */}
      <Card className="flex flex-col justify-between" padding="normal">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Plano Atual
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-2 flex items-center gap-1.5 font-display uppercase">
            <Shield className="h-5 w-5 text-indigo-500" />
            {subscriptionPlan || 'FREE'}
          </p>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          {subscriptionPlan === 'PREMIUM' ? 'Plano Premium' : 'Plano Gratuito'}
        </p>
      </Card>
    </div>
  );
}
