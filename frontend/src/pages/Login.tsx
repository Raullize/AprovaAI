import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GoogleButton from '../components/ui/GoogleButton';
import { useFormValidation } from '../hooks/useFormValidation';
import { useToast } from '../hooks/use-toast';
import type { LoginForm } from '../types';
import Loading from '../components/ui/Loading';
import { AxiosError } from 'axios';

export default function Login() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { validateLoginForm, getFieldError, clearErrors } = useFormValidation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Em breve você poderá fazer login com Google!",
      variant: "default"
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
      await signIn({
        email: formData.email || '',
        password: formData.password || '',
      });

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao AprovaAI.",
        variant: "success",
      });

      // Pequeno delay para ver o toast antes de navegar (opcional, mas bom para UX)
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: unknown) {
      console.error('Login error:', error);
      const err = error as AxiosError<{ error: string }>;
      const errorMessage = err.response?.data?.error || 'Credenciais inválidas. Verifique e tente novamente.';

      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Bem-vindo de volta!"
      subtitle="Entre na sua conta para continuar seus estudos"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="space-y-1">
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
          <div className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loading size="xs" className="mr-2" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
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
              to="/register" 
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
