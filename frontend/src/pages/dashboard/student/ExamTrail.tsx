import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Lock,
  Star,
  Trophy,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getIconOption, getColorOption } from '../../../config/examThemes';
import Modal from '../../../components/ui/Modal';

// --- Mock Data ---
interface MockLevel {
  id: string;
  name: string;
  order: number;
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED';
  stars?: number;
  questionsCount: number;
  xpReward: number;
  description?: string;
}

interface MockTopic {
  id: string;
  name: string;
  iconKey: string;
  colorScheme: string;
  levels: MockLevel[];
}

const MOCK_TOPICS: MockTopic[] = [
  {
    id: 'topic-1',
    name: 'Conceitos de Nuvem',
    iconKey: 'book-open',
    colorScheme: 'indigo',
    levels: [
      { id: 'lvl-1', name: 'O que é Cloud?', order: 1, status: 'COMPLETED', stars: 3, questionsCount: 10, xpReward: 50, description: 'Fundamentos da computação em nuvem e seus modelos.' },
      { id: 'lvl-2', name: 'Vantagens da Nuvem', order: 2, status: 'COMPLETED', stars: 2, questionsCount: 15, xpReward: 75, description: 'Agilidade, elasticidade e economia de custos globais.' },
      { id: 'lvl-3', name: 'Economia da Nuvem', order: 3, status: 'CURRENT', questionsCount: 12, xpReward: 60, description: 'CapEx vs OpEx e modelos de precificação da AWS.' },
      { id: 'lvl-4', name: 'Princípios de Design', order: 4, status: 'LOCKED', questionsCount: 10, xpReward: 50, description: 'Como arquitetar para a nuvem de forma eficiente.' },
      { id: 'lvl-5', name: 'Arquitetura Global AWS', order: 5, status: 'LOCKED', questionsCount: 14, xpReward: 70, description: 'Regiões, Zonas de Disponibilidade e Edge Locations.' },
    ],
  },
  {
    id: 'topic-2',
    name: 'Segurança e Conformidade',
    iconKey: 'shield',
    colorScheme: 'violet',
    levels: [
      { id: 'lvl-6', name: 'Modelo Compartilhado', order: 1, status: 'LOCKED', questionsCount: 10, xpReward: 50, description: 'Responsabilidades de segurança do cliente vs AWS.' },
      { id: 'lvl-7', name: 'IAM e Controle de Acesso', order: 2, status: 'LOCKED', questionsCount: 12, xpReward: 60, description: 'Gerenciamento de usuários, grupos e políticas.' },
    ],
  },
  {
    id: 'topic-3',
    name: 'Serviços Principais',
    iconKey: 'cpu',
    colorScheme: 'emerald',
    levels: [
      { id: 'lvl-8', name: 'Computação (EC2)', order: 1, status: 'LOCKED', questionsCount: 8, xpReward: 40, description: 'Máquinas virtuais elásticas na nuvem.' },
      { id: 'lvl-9', name: 'Armazenamento (S3)', order: 2, status: 'LOCKED', questionsCount: 10, xpReward: 50, description: 'Armazenamento de objetos escalável e durável.' },
    ],
  },
];

// --- Sub-components ---

const StarRating = ({ stars }: { stars: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3].map((s) => (
      <Star
        key={s}
        className={cn(
          "h-3.5 w-3.5",
          s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-300'
        )}
      />
    ))}
  </div>
);

const COLOR_THEMES: Record<string, {
  bgLight: string;
  borderLight: string;
  textDark: string;
  buttonBg: string;
  buttonBorder: string;
}> = {
  indigo: {
    bgLight: 'bg-indigo-50/80',
    borderLight: 'border-indigo-150',
    textDark: 'text-indigo-750',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
    buttonBorder: 'border-indigo-800',
  },
  emerald: {
    bgLight: 'bg-emerald-50/80',
    borderLight: 'border-emerald-150',
    textDark: 'text-emerald-700',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    buttonBorder: 'border-emerald-800',
  },
  orange: {
    bgLight: 'bg-orange-50/80',
    borderLight: 'border-orange-150',
    textDark: 'text-orange-700',
    buttonBg: 'bg-orange-600 hover:bg-orange-700',
    buttonBorder: 'border-orange-800',
  },
  sky: {
    bgLight: 'bg-sky-50/80',
    borderLight: 'border-sky-150',
    textDark: 'text-sky-700',
    buttonBg: 'bg-sky-600 hover:bg-sky-700',
    buttonBorder: 'border-sky-800',
  },
  violet: {
    bgLight: 'bg-violet-50/80',
    borderLight: 'border-violet-150',
    textDark: 'text-violet-750',
    buttonBg: 'bg-violet-600 hover:bg-violet-700',
    buttonBorder: 'border-violet-800',
  },
  rose: {
    bgLight: 'bg-rose-50/80',
    borderLight: 'border-rose-150',
    textDark: 'text-rose-700',
    buttonBg: 'bg-rose-600 hover:bg-rose-700',
    buttonBorder: 'border-rose-800',
  },
  amber: {
    bgLight: 'bg-amber-50/80',
    borderLight: 'border-amber-150',
    textDark: 'text-amber-705',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
    buttonBorder: 'border-amber-800',
  },
  slate: {
    bgLight: 'bg-slate-100/80',
    borderLight: 'border-slate-300',
    textDark: 'text-slate-800',
    buttonBg: 'bg-slate-700 hover:bg-slate-800',
    buttonBorder: 'border-slate-900',
  },
};

const LevelNodeTimeline = ({
  level,
  topic,
  onStart,
  isLast,
}: {
  level: MockLevel;
  topic: MockTopic;
  onStart: (id: string) => void;
  isLast: boolean;
}) => {
  const isCompleted = level.status === 'COMPLETED';
  const isCurrent = level.status === 'CURRENT';
  const isLocked = level.status === 'LOCKED';
  const side = level.order % 2 === 0 ? 'right' : 'left';
  const colorOpt = getColorOption(topic.colorScheme);
  const theme = COLOR_THEMES[topic.colorScheme] || COLOR_THEMES.indigo;

  return (
    <div className="relative flex justify-center items-center w-full min-h-[140px] lg:min-h-[180px] py-4">
      {/* Central Vertical Line */}
      {!isLast && (
        <div className={cn(
          "absolute top-[50%] bottom-[-50%] w-2 lg:w-3 rounded-full",
          isCompleted ? colorOpt.bg : "bg-slate-200"
        )} />
      )}

      {/* Desktop Rich Card (Left or Right) */}
      <div className={cn(
        "hidden lg:block absolute w-[calc(50%-5rem)] xl:w-[calc(50%-6rem)] group transition-all duration-300",
        side === 'left' ? "right-1/2 mr-10 xl:mr-14 text-right" : "left-1/2 ml-10 xl:ml-14 text-left"
      )}>
        <div className={cn(
          "p-6 rounded-3xl shadow-sm border transition-all duration-300",
          isCurrent ? cn(theme.bgLight, theme.borderLight, "shadow-md scale-105") : "bg-white border-slate-200 hover:shadow-md",
          isLocked && "opacity-60 grayscale hover:grayscale-0"
        )}>
          <div className={cn("flex flex-col gap-2", side === 'left' && "items-end")}>
            <h3 className={cn("text-xl font-bold font-display", isCurrent ? theme.textDark : "text-slate-800")}>
              {level.name}
            </h3>
            {level.description && (
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                {level.description}
              </p>
            )}
            
            <div className={cn("flex items-center gap-4 mt-2", side === 'left' && "flex-row-reverse")}>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 font-bold text-sm">
                <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                {level.xpReward} XP
              </div>
              <div className="text-slate-400 font-medium text-sm flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" />
                {level.questionsCount} questões
              </div>
            </div>
            
            {isCurrent && (
               <button
                 onClick={() => onStart(level.id)}
                 className={cn("mt-4 flex items-center gap-2 text-white font-bold px-6 py-3 rounded-2xl shadow-md border-b-4 hover:-translate-y-0.5 active:translate-y-0 active:border-b-0 transition-all", theme.buttonBg, theme.buttonBorder)}
               >
                 <PlayCircle className="h-5 w-5" />
                 INICIAR AGORA
               </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tooltip (like old layout) */}
      <div
        className={cn(
          "absolute lg:hidden max-w-[140px] z-10 pointer-events-none transition-opacity",
          side === 'left' ? 'right-[calc(50%+40px)]' : 'left-[calc(50%+40px)]',
        )}
      >
        {(isCompleted || isCurrent) && (
          <div className={cn("rounded-xl p-2.5 text-xs shadow-sm border", isCurrent ? cn(theme.bgLight, theme.borderLight) : 'bg-white border-slate-200')}>
            <p className={cn("font-bold mb-0.5 leading-tight", isCurrent ? theme.textDark : 'text-slate-700')}>
              {level.name}
            </p>
            <div className={cn("flex items-center gap-1 mt-1.5 font-bold", colorOpt.text)}>
              <Zap className="h-3 w-3 fill-current" />
              {level.xpReward} XP
            </div>
          </div>
        )}
        {isLocked && (
          <div className={cn("text-xs font-bold text-slate-400", side === 'left' ? 'text-right' : 'text-left')}>
            {level.name}
          </div>
        )}
      </div>

      {/* The Central Node */}
      <div className="relative z-20">
        {isCompleted && (
          <button
            onClick={() => onStart(level.id)}
            className={cn("w-16 h-16 lg:w-20 lg:h-20 rounded-full flex flex-col items-center justify-center shadow-md transition-all hover:scale-105 bg-gradient-to-br ring-4 lg:ring-[6px]", colorOpt.gradient, colorOpt.ring)}
          >
            <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-white mb-0.5" />
            <StarRating stars={level.stars!} />
          </button>
        )}

        {isCurrent && (
          <div className="relative flex flex-col items-center gap-3">
            <div className={cn("absolute inset-0 rounded-full animate-ping scale-[1.3] lg:scale-150 opacity-30", colorOpt.bg)} />
            <button
              onClick={() => onStart(level.id)}
              className={cn("relative w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center bg-gradient-to-br shadow-xl hover:scale-105 transition-all active:scale-95 ring-4 lg:ring-[6px]", colorOpt.gradient, colorOpt.ring)}
            >
              <Star className="h-8 w-8 lg:h-10 lg:w-10 text-white fill-white/80" />
            </button>
            <button
              onClick={() => onStart(level.id)}
              className={cn("lg:hidden relative z-10 text-white text-sm font-bold px-6 py-2.5 rounded-2xl shadow-md active:translate-y-1 transition-all bg-gradient-to-br", colorOpt.gradient)}
            >
              INICIAR
            </button>
          </div>
        )}

        {isLocked && (
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-slate-200 ring-4 lg:ring-[6px] ring-slate-100 cursor-not-allowed">
            <Lock className="h-6 w-6 lg:h-8 lg:w-8 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Component ---
export default function ExamTrail() {
  const navigate = useNavigate();
  const [expandedTopic, setExpandedTopic] = useState<string | null>('topic-1');
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  // Ensure scroll top on topic change in desktop
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [expandedTopic]);

  const handleStartLevel = (levelId: string) => {
    setSelectedLevelId(levelId);
  };

  const activeTopicObj = MOCK_TOPICS.find(t => t.id === expandedTopic) || MOCK_TOPICS[0];
  const totalCompleted = MOCK_TOPICS.reduce((acc, t) => acc + t.levels.filter(l => l.status === 'COMPLETED').length, 0);
  const totalLevels = MOCK_TOPICS.reduce((acc, t) => acc + t.levels.length, 0);
  const globalProgress = (totalCompleted / totalLevels) * 100;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 py-8 pb-32">
        
        {/* Mobile-only Exam Info Card */}
        <div className="lg:hidden bg-white p-5 rounded-3xl shadow-sm border border-slate-200 text-center mb-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-800 font-display truncate">
                AWS Cloud Practitioner
              </h1>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Trilha de Certificação</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-none">Progresso</span>
              <span className="text-sm font-bold text-indigo-600 leading-tight block mt-0.5">
                {totalCompleted}/{totalLevels}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          
          {/* --- LEFT COLUMN: DESKTOP SIDEBAR --- */}
          <div className="hidden lg:block col-span-4 relative">
            <div className="sticky top-24 space-y-6">
              
              {/* Exam Info Card */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <PlayCircle className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 font-display">
                  AWS Cloud Practitioner
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Trilha de Certificação</p>
                
                <div className="mt-6 text-left">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progresso Global</span>
                    <span className="text-sm font-bold text-indigo-600">{totalCompleted}/{totalLevels}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${globalProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Topic List */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Tópicos do Exame</h2>
                </div>
                <div className="p-2 space-y-1">
                  {MOCK_TOPICS.map((topic) => {
                    const isActive = expandedTopic === topic.id;
                    const completed = topic.levels.filter(l => l.status === 'COMPLETED').length;
                    const iconOpt  = getIconOption(topic.iconKey);
                    const colorOpt = getColorOption(topic.colorScheme);
                    const TopicIcon = iconOpt.Icon;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setExpandedTopic(topic.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group",
                          isActive ? "bg-indigo-50" : "hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gradient-to-br",
                          isActive ? colorOpt.gradient : "bg-slate-100 group-hover:bg-slate-200"
                        )}>
                          <TopicIcon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-bold truncate text-sm transition-colors",
                            isActive ? "text-indigo-900" : "text-slate-700"
                          )}>
                            {topic.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {completed}/{topic.levels.length} concluídos
                          </p>
                        </div>
                        <ChevronRight className={cn(
                          "h-5 w-5 transition-transform",
                          isActive ? "text-indigo-500 translate-x-1" : "text-slate-300"
                        )} />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>


          {/* --- RIGHT COLUMN: THE TRAIL --- */}
          <div className="col-span-12 lg:col-span-8">
            
            {/* Mobile Accordion View */}
            <div className="lg:hidden space-y-4">
                  {MOCK_TOPICS.map((topic) => {
                const isExpanded = expandedTopic === topic.id;
                const completedCount = topic.levels.filter((l) => l.status === 'COMPLETED').length;
                const iconOpt  = getIconOption(topic.iconKey);
                const colorOpt = getColorOption(topic.colorScheme);
                const MobIcon  = iconOpt.Icon;

                return (
                  <div key={topic.id} className="rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                    <button
                      onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br", colorOpt.gradient)}>
                          <MobIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">{topic.name}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {completedCount}/{topic.levels.length} níveis concluídos
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn("h-5 w-5 text-slate-400 transition-transform", isExpanded && "rotate-90")}
                      />
                    </button>
                    <div className="mx-4 mb-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full transition-all duration-700"
                        style={{ width: `${(completedCount / topic.levels.length) * 100}%` }}
                      />
                    </div>
                    {isExpanded && (
                      <div className="pt-4 pb-8 overflow-hidden">
                        <div className="flex flex-col items-center">
                          {topic.levels.map((level, idx) => (
                            <LevelNodeTimeline
                              key={level.id}
                              level={level}
                              topic={topic}
                              onStart={handleStartLevel}
                              isLast={idx === topic.levels.length - 1}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Timeline View */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10 min-h-[800px]">
              <div className="mb-12 text-center">
                <div className={cn("inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br", getColorOption(activeTopicObj.colorScheme).gradient)}>
                  {(() => { const I = getIconOption(activeTopicObj.iconKey).Icon; return <I className="h-8 w-8 text-white" />; })()}
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">
                  {activeTopicObj.name}
                </h2>
                <p className="text-slate-500 text-lg">Continue sua jornada de aprendizado</p>
              </div>

              <div className="flex flex-col items-center py-8">
                {activeTopicObj.levels.map((level, idx) => (
                  <LevelNodeTimeline
                    key={level.id}
                    level={level}
                    topic={activeTopicObj}
                    onStart={handleStartLevel}
                    isLast={idx === activeTopicObj.levels.length - 1}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mode Selection Modal */}
      <Modal
        isOpen={selectedLevelId !== null}
        onClose={() => setSelectedLevelId(null)}
        title="Escolha o Modo do Exercício"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Como você prefere realizar este nível?
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (selectedLevelId) {
                  navigate(`/dashboard/simulations/engine/${selectedLevelId}?mode=PRACTICE`);
                }
                setSelectedLevelId(null);
              }}
              className="flex flex-col items-start text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
            >
              <span className="font-bold text-slate-800 group-hover:text-indigo-600">Modo Treino (Prática)</span>
              <span className="text-xs text-slate-500 mt-1">
                Ideal para aprender. Tem feedback imediato por questão e explicação detalhada da resposta. Sem tempo limite.
              </span>
            </button>

            <button
              onClick={() => {
                if (selectedLevelId) {
                  navigate(`/dashboard/simulations/engine/${selectedLevelId}?mode=EXAM`);
                }
                setSelectedLevelId(null);
              }}
              className="flex flex-col items-start text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
            >
              <span className="font-bold text-slate-800 group-hover:text-indigo-600">Modo Simulado (Exame)</span>
              <span className="text-xs text-slate-500 mt-1">
                Simulação real da prova. Tem tempo limite, permite avançar/voltar e marcar questões para revisar. O feedback só é exibido no final.
              </span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
