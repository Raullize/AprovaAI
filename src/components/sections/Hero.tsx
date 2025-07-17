'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Brain, Zap, Target } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-gray-900 leading-tight mb-6">
              Sua Jornada para a{' '}
              <span className="text-gradient">Aprovação</span>{' '}
              Começa Aqui
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Plataforma inovadora de estudos com simulados por níveis, gamificação e feedback detalhado. 
              Prepare-se para vestibulares, ENEM e certificações profissionais com inteligência artificial.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                size="lg"
                onClick={() => scrollToSection('#pricing')}
                className="group"
              >
                <span>Comece Grátis</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => scrollToSection('#features')}
              >
                Como Funciona
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-primary-600 mr-2" />
                <span>Simulados por Níveis</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-success-600 mr-2" />
                <span>Feedback Instantâneo</span>
              </div>
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-accent-600 mr-2" />
                <span>IA Personalizada</span>
              </div>
            </div>
          </div>

          {/* Visual Element - Prof. Sabichão */}
          <div className="flex justify-center lg:justify-end animate-slide-up">
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Mascote - Prof. Sabichão */}
                <div className="w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
                  <div className="text-center">
                    {/* Imagem do Prof. Sabichão */}
                    <div className="w-64 h-64 relative mx-auto">
                      <Image
                        src="/images/prof-sabichao.png"
                        alt="Prof. Sabichão - Assistente inteligente do AprovaAI"
                        width={256}
                        height={256}
                        className="object-contain"
                        priority
                        onError={(e) => {
                          // Fallback para quando a imagem não existe
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                                <span class="text-3xl">🌍</span>
                              </div>
                              <div class="w-16 h-8 bg-black rounded-full mx-auto opacity-80 mt-2"></div>
                              <div class="w-12 h-6 bg-black rounded-t-full mx-auto mt-1"></div>
                            `;
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements com animações modernas */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-success-100 rounded-full flex items-center justify-center shadow-lg animate-float-1">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center shadow-lg animate-float-2">
                  <span className="text-xl">⚡</span>
                </div>
                <div className="absolute top-1/2 -left-8 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shadow-md animate-float-3">
                  <span className="text-lg">🎯</span>
                </div>
              </div>
              
              {/* Texto do Prof. Sabichão - Centralizado em relação ao círculo */}
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-gray-800 mb-1">Prof. Sabichão</p>
                <p className="text-sm text-gray-600">Seu assistente inteligente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 