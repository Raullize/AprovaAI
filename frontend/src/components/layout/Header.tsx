import React, { useState, useEffect } from 'react';
import { Menu, X, GraduationCap, Star, Users, BookOpen, User } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Como Funciona', href: '#features' },
  { label: 'Planos', href: '#pricing' },
];

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signed, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 transition-all duration-300 ${isMenuOpen ? 'blur-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold font-display text-gray-900">
                AprovaAI
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.href)}
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  {item.label}
                </button>
              ))}
              {!signed && (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Login
                </button>
              )}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {signed ? (
                <>
                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    Login
                  </button>
                  <Button onClick={() => handleNavigation('#pricing')}>
                    Comece Grátis
                  </Button>
                </>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 md:hidden transition-all duration-300"
            onClick={toggleMenu}
          />
          
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden animate-slide-in-right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-primary-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-primary-600" />
                    </div>
                    <span className="text-xl font-bold text-white">AprovaAI</span>
                  </div>
                  <button
                    onClick={toggleMenu}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 py-6">
                  <nav className="px-6 space-y-2">
                    {signed && (
                      <button
                        onClick={() => handleNavigation('/dashboard')}
                        className="flex items-center space-x-3 w-full text-left px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                    )}
                    {navItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleNavigation(item.href)}
                        className="block w-full text-left px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>

                  <div className="px-6 mt-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      🚀 Por que AprovaAI?
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
                        <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-success-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">+10.000 estudantes</p>
                          <p className="text-xs text-gray-500">Confiaram no AprovaAI</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">500+ questões</p>
                          <p className="text-xs text-gray-500">Simulados completos</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-accent-50 rounded-lg">
                        <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-accent-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">98% aprovação</p>
                          <p className="text-xs text-gray-500">Taxa de sucesso</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-4">
                    {signed ? (
                      <>
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600">Olá, {user?.name || user?.email}</p>
                        </div>
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={signOut}
                        >
                          Sair
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className="w-full"
                          onClick={() => handleNavigation('#pricing')}
                        >
                          Comece Grátis Agora
                        </Button>
                        <button
                          onClick={() => handleNavigation('/login')}
                          className="w-full text-center text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                        >
                          Já tenho conta - Fazer Login
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
    </>
  );
};
