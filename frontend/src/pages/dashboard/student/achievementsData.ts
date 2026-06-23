import type { ComponentType } from 'react';
import { Trophy, Zap, Shield, Target, Clock, Compass } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  isUnlocked: boolean;
}

export const achievements: Achievement[] = [
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
