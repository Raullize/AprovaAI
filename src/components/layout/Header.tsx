'use client';

import React, { useState } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { NavItem } from '@/types';

const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Como Funciona', href: '#features' },
  { label: 'Planos', href: '#pricing' },
  { label: 'Login', href: '#login' },
];

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-gray-900">
              AprovaAI
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.slice(0, -1).map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => scrollToSection('#login')}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Login
            </button>
            <Button onClick={() => scrollToSection('#pricing')}>
              Comece Grátis
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2">
                <Button 
                  className="w-full"
                  onClick={() => scrollToSection('#pricing')}
                >
                  Comece Grátis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}; 