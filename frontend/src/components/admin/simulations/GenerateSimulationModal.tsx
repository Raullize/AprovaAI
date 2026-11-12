import { useState } from 'react';
import { Database, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { useToast } from '@/hooks/useToast';
import {
  simulationsService,
  type EnemDiscipline,
  type EnemLanguage,
  type GenerateSimulationDTO,
} from '@/services/simulations.service';
import type { SimulationMode } from '@/types/simulation.types';

interface GenerateSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (simulationId: string) => void;
  topicId: string;
  topicName: string;
  examName: string;
}

const DISCIPLINES: { value: EnemDiscipline; label: string }[] = [
  { value: 'matematica', label: 'Matemática e suas Tecnologias' },
  {
    value: 'linguagens',
    label: 'Linguagens, Códigos e suas Tecnologias',
  },
  { value: 'ciencias-humanas', label: 'Ciências Humanas e suas Tecnologias' },
  {
    value: 'ciencias-natureza',
    label: 'Ciências da Natureza e suas Tecnologias',
  },
];

const YEAR_PRESETS = [
  {
    value: '5',
    label: 'Últimos 5 anos (2019–2023)',
    years: [2019, 2020, 2021, 2022, 2023],
  },
  {
    value: '3',
    label: 'Últimos 3 anos (2021–2023)',
    years: [2021, 2022, 2023],
  },
  { value: '2023', label: 'Somente 2023', years: [2023] },
  { value: '2022', label: 'Somente 2022', years: [2022] },
  { value: '2021', label: 'Somente 2021', years: [2021] },
  { value: '2020', label: 'Somente 2020', years: [2020] },
  { value: '2019', label: 'Somente 2019', years: [2019] },
];

function inferDiscipline(topicName: string): EnemDiscipline | '' {
  const normalized = topicName.toLowerCase();

  if (normalized.includes('matem')) return 'matematica';
  if (
    normalized.includes('linguagens') ||
    normalized.includes('códigos') ||
    normalized.includes('codigos')
  ) {
    return 'linguagens';
  }
  if (normalized.includes('humanas')) return 'ciencias-humanas';
  if (normalized.includes('natureza')) return 'ciencias-natureza';

  return '';
}

export function GenerateSimulationModal({
  isOpen,
  onClose,
  onSuccess,
  topicId,
  topicName,
  examName,
}: GenerateSimulationModalProps) {
  const { toast } = useToast();
  const [source, setSource] = useState<'ENEM' | 'AI'>('ENEM');
  const [count, setCount] = useState(10);
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<EnemDiscipline | ''>(() =>
    inferDiscipline(topicName),
  );
  const [yearPreset, setYearPreset] = useState('5');
  const [language, setLanguage] = useState<EnemLanguage>('ingles');
  const [focus, setFocus] = useState('');
  const [simulationMode, setSimulationMode] =
    useState<SimulationMode>('PRACTICE');
  const [xpReward, setXpReward] = useState(100);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (source === 'ENEM' && !discipline) {
      toast({
        title: 'Selecione a disciplina',
        description: 'Escolha a disciplina do ENEM para gerar as questões.',
        variant: 'destructive',
      });
      return;
    }

    const years = YEAR_PRESETS.find((preset) => preset.value === yearPreset)
      ?.years ?? [2023];
    const base = {
      topicId,
      count,
      name: name.trim() || undefined,
      simulationMode,
      xpReward,
      passingPercentage,
      timeLimit: timeLimitMinutes === '' ? null : Number(timeLimitMinutes) * 60,
    };

    const payload: GenerateSimulationDTO =
      source === 'ENEM'
        ? {
            ...base,
            source: 'ENEM',
            discipline: discipline as EnemDiscipline,
            years,
            language: discipline === 'linguagens' ? language : undefined,
          }
        : {
            ...base,
            source: 'AI',
            focus: focus.trim() || undefined,
          };

    try {
      setIsSubmitting(true);
      const simulation = await simulationsService.generate(payload);
      toast({
        title: 'Simulado gerado como rascunho',
        description: 'Revise as questões antes de publicar.',
        variant: 'success',
      });
      onSuccess(simulation.id);
    } catch {
      toast({
        title: 'Não foi possível gerar o simulado',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerar simulado com IA"
      size="lg"
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-500">
          As questões serão criadas como <strong>rascunho</strong> para revisão
          antes da publicação. Contexto: {examName} › {topicName}.
        </p>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setSource('ENEM')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              source === 'ENEM'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="h-4 w-4" /> ENEM
          </button>
          <button
            type="button"
            onClick={() => setSource('AI')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              source === 'AI'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="h-4 w-4" /> IA
          </button>
        </div>

        {source === 'ENEM' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Disciplina
                </span>
                <select
                  value={discipline}
                  onChange={(event) =>
                    setDiscipline(event.target.value as EnemDiscipline | '')
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Selecione...</option>
                  {DISCIPLINES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Anos
                </span>
                <select
                  value={yearPreset}
                  onChange={(event) => setYearPreset(event.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {YEAR_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {discipline === 'linguagens' && (
              <label className="block sm:w-1/2">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Idioma
                </span>
                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as EnemLanguage)
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ingles">Inglês</option>
                  <option value="espanhol">Espanhol</option>
                </select>
              </label>
            )}
          </div>
        ) : (
          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">
              Foco (opcional)
            </span>
            <textarea
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Ex.: fundamentos de cloud computing, redes e segurança"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </label>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">
              Questões
            </span>
            <select
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">
              Modo
            </span>
            <select
              value={simulationMode}
              onChange={(event) =>
                setSimulationMode(event.target.value as SimulationMode)
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="PRACTICE">Treino</option>
              <option value="EXAM">Exame</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">
              XP
            </span>
            <input
              type="number"
              min={0}
              value={xpReward}
              onChange={(event) => setXpReward(Number(event.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">
              Aprovação (%)
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={passingPercentage}
              onChange={(event) =>
                setPassingPercentage(Number(event.target.value))
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nome (opcional)
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              placeholder="Gerado automaticamente se vazio"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tempo limite (min, opcional)
            </span>
            <input
              type="number"
              min={1}
              value={timeLimitMinutes}
              onChange={(event) =>
                setTimeLimitMinutes(
                  event.target.value === '' ? '' : Number(event.target.value),
                )
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="gamified"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 px-5"
          >
            {isSubmitting ? (
              <Loading size="xs" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Gerar simulado
          </Button>
        </div>
      </div>
    </Modal>
  );
}
