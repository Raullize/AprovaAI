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
export const ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: 'graduation-cap', label: 'Formatura',    Icon: GraduationCap },
  { key: 'trophy',         label: 'Troféu',       Icon: Trophy        },
  { key: 'star',           label: 'Estrela',      Icon: Star          },
  { key: 'book-open',      label: 'Livro',        Icon: BookOpen      },
  { key: 'target',         label: 'Alvo',         Icon: Target        },
  { key: 'award',          label: 'Medalha',      Icon: Award         },
  { key: 'zap',            label: 'Raio',         Icon: Zap           },
  { key: 'shield',         label: 'Escudo',       Icon: Shield        },
  { key: 'cpu',            label: 'Tecnologia',   Icon: Cpu           },
  { key: 'globe',          label: 'Global',       Icon: Globe         },
];

// --- Color registry ---
export const COLOR_OPTIONS: { key: string; label: string; gradient: string; bg: string; ring: string; text: string } [] = [
  { key: 'indigo',   label: 'Índigo',    gradient: 'from-indigo-500 to-violet-600',   bg: 'bg-indigo-100',  ring: 'ring-indigo-200',  text: 'text-indigo-600' },
  { key: 'emerald',  label: 'Verde',     gradient: 'from-emerald-400 to-teal-500',    bg: 'bg-emerald-100', ring: 'ring-emerald-200', text: 'text-emerald-600' },
  { key: 'orange',   label: 'Laranja',   gradient: 'from-orange-400 to-red-500',      bg: 'bg-orange-100',  ring: 'ring-orange-200',  text: 'text-orange-600' },
  { key: 'sky',      label: 'Azul Céu',  gradient: 'from-sky-400 to-blue-500',        bg: 'bg-sky-100',     ring: 'ring-sky-200',     text: 'text-sky-600' },
  { key: 'violet',   label: 'Violeta',   gradient: 'from-violet-500 to-purple-600',   bg: 'bg-violet-100',  ring: 'ring-violet-200',  text: 'text-violet-600' },
  { key: 'rose',     label: 'Rosa',      gradient: 'from-rose-400 to-pink-500',       bg: 'bg-rose-100',    ring: 'ring-rose-200',    text: 'text-rose-600' },
  { key: 'amber',    label: 'Âmbar',     gradient: 'from-amber-400 to-yellow-500',    bg: 'bg-amber-100',   ring: 'ring-amber-200',   text: 'text-amber-600' },
  { key: 'slate',    label: 'Cinza',     gradient: 'from-slate-600 to-slate-800',     bg: 'bg-slate-100',   ring: 'ring-slate-200',   text: 'text-slate-600' },
];

const DEFAULT_ICON  = ICON_OPTIONS[0];
const DEFAULT_COLOR = COLOR_OPTIONS[0];

// --- Helpers ---
export function getIconOption(key?: string | null) {
  return ICON_OPTIONS.find((o) => o.key === key) ?? DEFAULT_ICON;
}

export function getColorOption(key?: string | null) {
  return COLOR_OPTIONS.find((o) => o.key === key) ?? DEFAULT_COLOR;
}
