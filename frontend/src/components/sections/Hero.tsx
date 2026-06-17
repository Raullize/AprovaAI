import React from 'react';
import Button from '../ui/Button';
import { ArrowRight, Brain, Zap, Target } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="pt-24 pb-16 bg-slate-50 min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-slate-900 leading-tight mb-6 tracking-tight">
              Sua Jornada para a{' '}
              <span className="text-indigo-600">Aprovação</span> Começa Aqui
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Plataforma inovadora de estudos com simulados por níveis,
              gamificação e feedback detalhado. Prepare-se para vestibulares,
              ENEM e certificações profissionais com inteligência artificial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button
                size="lg"
                onClick={() => scrollToSection('#pricing')}
                className="group px-8 py-4 text-base"
              >
                <span>Comece Grátis</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('#features')}
                className="px-8 py-4 text-base"
              >
                Como Funciona
              </Button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-sm font-medium text-slate-600">
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <Target className="h-5 w-5 text-indigo-500 mr-2" />
                <span>Simulados por Níveis</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <Zap className="h-5 w-5 text-amber-500 mr-2" />
                <span>Feedback Instantâneo</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <Brain className="h-5 w-5 text-violet-500 mr-2" />
                <span>IA Personalizada</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end animate-slide-up">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-white shadow-2xl shadow-indigo-500/10 overflow-hidden">
                  <div className="text-center">
                    <div className="w-64 h-64 relative mx-auto">
                      <img
                        src="/images/prof-sabichao.png"
                        alt="Prof. Sabichão - Assistente inteligente do AprovaAI"
                        className="object-contain w-full h-full transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center bg-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-100 rotate-45 border-b-0 border-r-0" />
                <p className="text-lg font-bold text-slate-800 mb-0.5 relative z-10">
                  Prof. Sabichão
                </p>
                <p className="text-sm text-slate-500 relative z-10 font-medium">
                  Seu assistente inteligente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
