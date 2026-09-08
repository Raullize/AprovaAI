import { Clock3 } from 'lucide-react';
import SimulationNodeTimeline, {
  type SimulationData,
  type TopicData,
} from './SimulationNodeTimeline';

interface TopicTimelineProps {
  topic: TopicData;
  onStart: (simulation: SimulationData, topic: TopicData) => void;
}

function ComingSoonNodeTimeline() {
  return (
    <div className="relative flex justify-center items-center w-full min-h-[140px] lg:min-h-[180px] py-4">
      <div className="hidden lg:block absolute left-1/2 ml-16 xl:ml-20 w-[calc(50%-7rem)] xl:w-[calc(50%-8rem)]">
        <div className="p-4 lg:p-5 rounded-3xl border border-dashed border-slate-300 bg-slate-100/80 shadow-sm opacity-80">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold font-display text-slate-600">
              Em breve
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Este tópico ainda vai receber novos simulados. Continue
              acompanhando a trilha para liberar o próximo desafio.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute lg:hidden left-[calc(50%+40px)] max-w-[140px] z-10 pointer-events-none">
        <div className="rounded-xl p-2.5 text-xs shadow-sm border border-dashed border-slate-300 bg-slate-100/80 opacity-80">
          <p className="font-bold mb-0.5 leading-tight text-slate-600">
            Em breve
          </p>
          <p className="text-slate-500 leading-relaxed">
            Novos simulados serão adicionados aqui.
          </p>
        </div>
      </div>

      <div className="relative z-20 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-slate-200 ring-4 lg:ring-[6px] ring-slate-100 shadow-md cursor-not-allowed">
        <Clock3 className="h-6 w-6 lg:h-8 lg:w-8 text-slate-400" />
      </div>
    </div>
  );
}

export function TopicTimeline({ topic, onStart }: TopicTimelineProps) {
  return (
    <div className="flex flex-col items-center py-4">
      {topic.simulations.map((simulation, idx) => (
        <SimulationNodeTimeline
          key={simulation.id}
          simulation={simulation}
          topic={topic}
          onStart={onStart}
          isLast={idx === topic.simulations.length - 1 && !topic.showComingSoon}
        />
      ))}
      {topic.showComingSoon && <ComingSoonNodeTimeline />}
    </div>
  );
}
