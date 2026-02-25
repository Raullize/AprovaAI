'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import AuthLayout from '@/components/auth/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GoogleButton from '@/components/ui/GoogleButton';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useToast } from '@/hooks/use-toast';
import type { LoginForm } from '@/types';
import Loading from '@/components/ui/Loading';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { validateLoginForm, getFieldError, clearErrors } = useFormValidation();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      toast({
        title: "Sucesso",
        description: urlMessage,
        variant: "success",
      });
    }
  }, [searchParams, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade em desenvolvimento. Em breve você poderá fazer login com Google!",
      variant: "default",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    clearErrors();
    
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
        toast({
          title: "Erro no login",
          description: "E-mail ou senha inválidos.",
          variant: "destructive",
        });
      } else if (result?.ok) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando...",
          variant: "success",
        });
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
      toast({
        title: "Erro interno",
        description: "Erro interno do servidor. Tente novamente.",
        variant: "destructive",
      });
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

        <div className="text-right">
          <Link 
            href="#" 
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Loading size="xs" className="mr-2" />}
          Entrar
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        <GoogleButton
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          Continuar com Google
        </GoogleButton>

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