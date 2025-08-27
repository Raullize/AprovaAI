'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import AuthLayout from '@/components/auth/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useFormValidation } from '@/hooks/useFormValidation';
import type { LoginForm } from '@/types';
import Loading from '@/components/ui/Loading';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { validateLoginForm, getFieldError, clearErrors } = useFormValidation();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success message from registration
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage({ type: 'success', text: urlMessage });
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage(null);
    clearErrors();
    
    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setMessage({ type: 'error', text: 'E-mail ou senha inválidos.' });
      } else if (result?.ok) {
        setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
        // Wait a moment to show success message, then redirect
        setTimeout(async () => {
          const session = await getSession();
          if (session?.user?.role === 'ADMIN') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Erro interno do servidor. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Login no AprovaAI"
      subtitle="Entre em sua conta e continue sua jornada de estudos"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg border ${
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

        {/* Password Field */}
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

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link 
            href="#" 
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Loading size="xs" className="mr-2" />}
          Entrar
        </Button>

        {/* Register Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            Não tem uma conta?{' '}
            <Link 
              href="/register" 
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}