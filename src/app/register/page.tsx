'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useFormValidation } from '@/hooks/useFormValidation';
import type { RegisterForm } from '@/types';
import { Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function RegisterPage() {
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { validateRegisterForm, getFieldError, clearErrors, calculatePasswordStrength } = useFormValidation();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const validateStep1 = () => {
    const step1Errors = [];
    
    if (!formData.fullName.trim()) {
      step1Errors.push('Nome completo é obrigatório');
    }
    if (!formData.username.trim()) {
      step1Errors.push('Nome de usuário é obrigatório');
    }
    if (!formData.email.trim()) {
      step1Errors.push('E-mail é obrigatório');
    }
    if (!formData.dateOfBirth) {
      step1Errors.push('Data de nascimento é obrigatória');
    }
    
    return step1Errors.length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      clearErrors();
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    clearErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage(null);
    clearErrors();
    
    // Validate form
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Conta criada com sucesso! Redirecionando para login...' });
        
        // Redirect to login after success
        setTimeout(() => {
          router.push('/login?message=Conta criada com sucesso! Faça login para continuar.');
        }, 2000);
      } else {
        // Handle specific error messages from API
        setMessage({ 
          type: 'error', 
          text: data.error || 'Erro ao criar conta. Tente novamente.' 
        });
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: 'Erro interno do servidor. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  return (
    <AuthLayout 
      title="Crie sua conta no AprovaAI"
      subtitle="Junte-se a milhares de estudantes e comece sua jornada"
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
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
          
          {/* Connector */}
          <div className={`w-8 h-0.5 ${
            currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'
          }`} />
          
          {/* Step 2 */}
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

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {message.type === 'success' ? '✓' : '⚠'}
            </span>
            {message.text}
          </div>
        </div>
      )}

      <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-6">
        {currentStep === 1 ? (
          // Step 1: Personal Data
          <>
            {/* Full Name Field */}
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

            {/* Username Field */}
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

            {/* Email Field */}
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

            {/* Date of Birth Field */}
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

            {/* Next Button */}
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
          // Step 2: Security
          <>
            {/* Password Field */}
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
              
              {/* Password Strength Indicator */}
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

            {/* Confirm Password Field */}
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

            {/* Terms Checkbox */}
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
                  <Link href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Termos de Uso
                  </Link>
                  {' '}e{' '}
                  <Link href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              {getFieldError('acceptTerms') && (
                <p className="text-sm text-red-600">{getFieldError('acceptTerms')}</p>
              )}
            </div>

            {/* Navigation Buttons */}
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar'
                )}
              </Button>
            </div>
          </>
        )}

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              href="/login" 
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