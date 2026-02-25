import React from 'react';
import { Check, Star, Zap, GraduationCap } from 'lucide-react';
import Button from '../ui/Button';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaVariant: 'primary' | 'outline';
  isPopular: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    price: 'Grátis',
    description: 'Perfeito para começar sua jornada de estudos',
    features: [
      'Acesso limitado a conteúdos iniciais',
      'Simulados com intervalo de 6 horas',
      'Feedback básico das questões',
      'Progresso por níveis',
      'Acesso limitado ao Prof. Sabichão*',
      'Anúncios discretos'
    ],
    ctaText: 'Comece Grátis',
    ctaVariant: 'outline',
    isPopular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 29,90/mês',
    description: 'Aprovação total com recursos ilimitados',
    features: [
      'Simulados completamente ilimitados',
      'Acesso total ao Prof. Sabichão*',
      'Relatórios detalhados de desempenho',
      'Acesso antecipado a novos conteúdos',
      'Questões exclusivas premium',
      'Sem anúncios',
      'Suporte prioritário',
      'Análise de pontos fortes/fracos'
    ],
    ctaText: 'Assine Agora',
    ctaVariant: 'primary',
    isPopular: true
  }
];

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-4">
            Escolha Seu Caminho para a Aprovação
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Oferecemos planos flexíveis para atender suas necessidades de estudo. 
            Comece grátis e evolua quando estiver pronto.
          </p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl ${
                plan.isPopular ? 'ring-2 ring-primary-600 transform scale-105' : ''
              }`}
            >
  
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Mais Popular
                  </div>
                </div>
              )}

  
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary-600">
                    {plan.price}
                  </span>
                </div>
                <p className="text-gray-600">
                  {plan.description}
                </p>
              </div>

  
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-0.5">
                      <Check className="h-5 w-5 text-success-600" />
                    </div>
                    <span className="text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

  
              <Button 
                variant={plan.ctaVariant}
                className="w-full justify-center"
                size="lg"
              >
                {plan.isPopular && <Zap className="mr-2 h-5 w-5" />}
                {plan.ctaText}
              </Button>

  
              {plan.isPopular && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Cancele a qualquer momento • Sem compromisso
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>


        <div className="text-center mt-12">
          <div className="mt-6 p-6 bg-blue-50 rounded-xl max-w-2xl mx-auto">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-600 mr-2" />
              Garantia de Satisfação
            </h4>
            <p className="text-gray-700 text-sm">
              Teste o plano Premium por 7 dias grátis. Se não ficar satisfeito, 
              cancele sem custos e continue no plano gratuito.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
