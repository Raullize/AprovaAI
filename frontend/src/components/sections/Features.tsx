import React from 'react';
import { BarChart3, Trophy, MessageSquare, Target } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    id: '1',
    title: 'Aprendizado por Níveis',
    description:
      'Progresso estruturado através de Exame > Tópico > Nível > Questões, garantindo aprendizado consistente e evolutivo.',
    icon: 'BarChart3',
  },
  {
    id: '2',
    title: 'Feedback Detalhado',
    description:
      'Explicações específicas para cada alternativa e links para aprofundamento, potencializando seu aprendizado.',
    icon: 'MessageSquare',
  },
  {
    id: '3',
    title: 'Gamificação Inteligente',
    description:
      'Conquiste medalhas, mantenha streaks de estudo e acompanhe seu progresso com sistema de recompensas motivador.',
    icon: 'Trophy',
  },
  {
    id: '4',
    title: 'Conteúdo Abrangente',
    description:
      'Preparação completa para vestibulares e certificações profissionais em uma única plataforma.',
    icon: 'Target',
  },
];

const iconMap = {
  BarChart3,
  Trophy,
  MessageSquare,
  Target,
};

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-4">
            Como o AprovaAI Revoluciona seus Estudos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nossa metodologia única combina estrutura pedagógica, tecnologia
            avançada e gamificação para maximizar seu potencial de aprovação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap];

            return (
              <div
                key={feature.id}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 card-hover group"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors duration-300">
                  <IconComponent className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold font-display text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold font-display mb-4">
              Pronto para Acelerar sua Aprovação?
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Junte-se a milhares de estudantes que já estão transformando seus
              resultados com o AprovaAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Teste Grátis por 7 Dias
              </button>
              <button className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200">
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
