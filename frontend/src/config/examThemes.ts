import {
  Trophy,
  Star,
  BookOpen,
  Target,
  Award,
  GraduationCap,
  Zap,
  Shield,
  Cpu,
  Globe,
  type LucideIcon,
} from 'lucide-react';

// --- Icon registry ---
export const ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] =
  [
    { key: 'graduation-cap', label: 'Formatura', Icon: GraduationCap },
    { key: 'trophy', label: 'Troféu', Icon: Trophy },
    { key: 'star', label: 'Estrela', Icon: Star },
    { key: 'book-open', label: 'Livro', Icon: BookOpen },
    { key: 'target', label: 'Alvo', Icon: Target },
    { key: 'award', label: 'Medalha', Icon: Award },
    { key: 'zap', label: 'Raio', Icon: Zap },
    { key: 'shield', label: 'Escudo', Icon: Shield },
    { key: 'cpu', label: 'Tecnologia', Icon: Cpu },
    { key: 'globe', label: 'Global', Icon: Globe },
  ];

export interface ColorThemeOptions {
  key: string;
  label: string;
  gradient: string;
  bg: string;
  ring: string;
  text: string;
  hex: string;
  bgLight: string;
  borderLight: string;
  textDark: string;
  buttonBg: string;
  buttonBorder: string;
}

// --- Color registry ---
export const COLOR_OPTIONS: ColorThemeOptions[] = [
  {
    key: 'indigo',
    label: 'Índigo',
    gradient: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-100',
    ring: 'ring-indigo-200',
    text: 'text-indigo-600',
    hex: '#4f46e5',
    bgLight: 'bg-indigo-50/80',
    borderLight: 'border-indigo-150',
    textDark: 'text-indigo-750',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
    buttonBorder: 'border-indigo-800',
  },
  {
    key: 'emerald',
    label: 'Verde',
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-100',
    ring: 'ring-emerald-200',
    text: 'text-emerald-600',
    hex: '#10b981',
    bgLight: 'bg-emerald-50/80',
    borderLight: 'border-emerald-150',
    textDark: 'text-emerald-700',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    buttonBorder: 'border-emerald-800',
  },
  {
    key: 'orange',
    label: 'Laranja',
    gradient: 'from-orange-400 to-red-500',
    bg: 'bg-orange-100',
    ring: 'ring-orange-200',
    text: 'text-orange-600',
    hex: '#f97316',
    bgLight: 'bg-orange-50/80',
    borderLight: 'border-orange-150',
    textDark: 'text-orange-700',
    buttonBg: 'bg-orange-600 hover:bg-orange-700',
    buttonBorder: 'border-orange-800',
  },
  {
    key: 'sky',
    label: 'Azul Céu',
    gradient: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-100',
    ring: 'ring-sky-200',
    text: 'text-sky-600',
    hex: '#0ea5e9',
    bgLight: 'bg-sky-50/80',
    borderLight: 'border-sky-150',
    textDark: 'text-sky-700',
    buttonBg: 'bg-sky-600 hover:bg-sky-700',
    buttonBorder: 'border-sky-800',
  },
  {
    key: 'violet',
    label: 'Violeta',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-100',
    ring: 'ring-violet-200',
    text: 'text-violet-600',
    hex: '#8b5cf6',
    bgLight: 'bg-violet-50/80',
    borderLight: 'border-violet-150',
    textDark: 'text-violet-750',
    buttonBg: 'bg-violet-600 hover:bg-violet-700',
    buttonBorder: 'border-violet-800',
  },
  {
    key: 'rose',
    label: 'Rosa',
    gradient: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-100',
    ring: 'ring-rose-200',
    text: 'text-rose-600',
    hex: '#f43f5e',
    bgLight: 'bg-rose-50/80',
    borderLight: 'border-rose-150',
    textDark: 'text-rose-700',
    buttonBg: 'bg-rose-600 hover:bg-rose-700',
    buttonBorder: 'border-rose-800',
  },
  {
    key: 'amber',
    label: 'Âmbar',
    gradient: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-100',
    ring: 'ring-amber-200',
    text: 'text-amber-600',
    hex: '#f59e0b',
    bgLight: 'bg-amber-50/80',
    borderLight: 'border-amber-150',
    textDark: 'text-amber-705',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
    buttonBorder: 'border-amber-800',
  },
  {
    key: 'slate',
    label: 'Cinza',
    gradient: 'from-slate-600 to-slate-800',
    bg: 'bg-slate-100',
    ring: 'ring-slate-200',
    text: 'text-slate-600',
    hex: '#475569',
    bgLight: 'bg-slate-100/80',
    borderLight: 'border-slate-300',
    textDark: 'text-slate-800',
    buttonBg: 'bg-slate-700 hover:bg-slate-800',
    buttonBorder: 'border-slate-900',
  },
];

const DEFAULT_ICON = ICON_OPTIONS[0];
const DEFAULT_COLOR = COLOR_OPTIONS[0];

// --- Helpers ---
export function getIconOption(key?: string | null) {
  return ICON_OPTIONS.find((o) => o.key === key) ?? DEFAULT_ICON;
}

export function getColorOption(key?: string | null): ColorThemeOptions {
  return COLOR_OPTIONS.find((o) => o.key === key) ?? DEFAULT_COLOR;
}
