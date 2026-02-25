import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GoogleButton from '../components/ui/GoogleButton';
import { useFormValidation } from '../hooks/useFormValidation';
import { useToast } from '../hooks/use-toast';
import type { RegisterForm } from '../types';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Loading from '../components/ui/Loading';
import api from '../services/api';

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterForm>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    acceptTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { validateRegisterForm, getFieldError, clearErrors, calculatePasswordStrength } = useFormValidation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const validateStep1 = () => {
    const step1Errors = [];
    
    if (!formData.fullName?.trim()) step1Errors.push('Nome completo é obrigatório');
    if (!formData.username?.trim()) step1Errors.push('Nome de usuário é obrigatório');
    if (!formData.email?.trim()) step1Errors.push('E-mail é obrigatório');
    if (!formData.dateOfBirth) step1Errors.push('Data de nascimento é obrigatória');
    
    return step1Errors.length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      clearErrors();
    } else {
        // Force validation to show errors
        validateRegisterForm(formData);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    clearErrors();
  };

  const handleGoogleSignup = async () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Em breve você poderá se cadastrar com Google!",
      variant: "default"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Registrar
      await api.post('/auth/register', {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para dashboard...",
        variant: "success"
      });
      
      // 2. Login Automático
      await signIn({
        email: formData.email,
        password: formData.password,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.response?.data?.error || 'Erro ao criar conta. Tente novamente.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password || '');

  return (
    <AuthLayout 
      title="Crie sua conta no AprovaAI"
      subtitle="Junte-se a milhares de estudantes e comece sua jornada"
    >
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
              currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > 1 ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= 1 ? 'text-primary-600' : 'text-gray-500'
            }`}>
              Dados Pessoais
            </span>
          </div>
          
          <div className={`w-8 h-0.5 ${
            currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'
          }`} />
          
          <div className="flex items-center">
            <div className={`w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
              currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= 2 ? 'text-primary-600' : 'text-gray-500'
            }`}>
              Segurança
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-4">
        {currentStep === 1 ? (
          <>
            <Input
              name="fullName"
              type="text"
              label="Nome Completo"
              placeholder="Seu nome completo"
              value={formData.fullName}
              onChange={handleInputChange}
              error={getFieldError('fullName')}
              disabled={isLoading}
              required
            />

            <Input
              name="username"
              type="text"
              label="Nome de Usuário"
              placeholder="seu_usuario"
              value={formData.username}
              onChange={handleInputChange}
              error={getFieldError('username')}
              disabled={isLoading}
              required
            />

            <Input
              name="email"
              type="email"
              label="E-mail"
              placeholder="seu.email@exemplo.com"
              value={formData.email}
              onChange={handleInputChange}
              error={getFieldError('email')}
              disabled={isLoading}
              required
            />

            <Input
              name="dateOfBirth"
              type="date"
              label="Data de Nascimento"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={getFieldError('dateOfBirth')}
              disabled={isLoading}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              Continuar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                label="Senha"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                error={getFieldError('password')}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                required
              />
              
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Força da senha:</span>
                    <span className={`font-medium ${
                      passwordStrength.label === 'Fraca' ? 'text-red-600' :
                      passwordStrength.label === 'Média' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.label === 'Fraca' ? 'bg-red-500' :
                        passwordStrength.label === 'Média' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((passwordStrength.score / 8) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              name="confirmPassword"
              type="password"
              label="Confirmar Senha"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={getFieldError('confirmPassword')}
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              required
            />

            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isLoading}
                  required
                />
                <span className="text-sm text-gray-600">
                  Eu aceito os{' '}
                  <Link to="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Termos de Uso
                  </Link>
                  {' '}e{' '}
                  <Link to="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              {getFieldError('acceptTerms') && (
                <p className="text-sm text-red-600">{getFieldError('acceptTerms')}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handlePrevStep}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
              
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading && <Loading size="xs" className="mr-2" />}
                Cadastrar
              </Button>
            </div>
          </>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        <GoogleButton
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          Continuar com Google
        </GoogleButton>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
