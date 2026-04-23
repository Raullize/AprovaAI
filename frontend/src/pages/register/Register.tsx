import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import GoogleButton from '../../components/ui/GoogleButton';
import { useToast } from '../../hooks/use-toast';
import { CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import Loading from '../../components/ui/Loading';
import { AxiosError } from 'axios';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema,
  type RegisterFormData,
} from '../../validations/auth.schema';
import { calculatePasswordStrength } from '../../utils/password';

export default function Register() {
  usePageTitle('Criar Conta');

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleNextStep = async () => {
    // Validate step 1 fields before proceeding
    const isStep1Valid = await trigger([
      'fullName',
      'username',
      'email',
      'dateOfBirth',
    ]);

    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handleGoogleLogin = async () => {
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'Em breve você poderá se cadastrar com o Google!',
      variant: 'default',
    });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      await signUp({
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
      });

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo ao AprovaAI. Prepare-se para a aprovação!',
        variant: 'success',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const err = error as AxiosError<{ error: string }>;
      const errorMessage =
        err.response?.data?.error ||
        'Ocorreu um erro ao criar sua conta. Tente novamente.';

      toast({
        title: 'Erro ao criar conta',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(passwordValue);

  return (
    <AuthLayout
      title="Crie sua conta gratuitamente"
      subtitle="Junte-se a milhares de estudantes e acelere sua aprovação"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                step >= 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                step >= 1 ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              Dados
            </span>
          </div>
          <div
            className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${
              step > 1 ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          />
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                step >= 2
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                step >= 2 ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              Segurança
            </span>
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Input
              {...register('fullName')}
              type="text"
              label="Nome completo"
              placeholder="João da Silva"
              error={errors.fullName?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...register('username')}
                type="text"
                label="Nome de usuário"
                placeholder="joaosilva"
                error={errors.username?.message}
              />
              <Input
                {...register('dateOfBirth')}
                type="date"
                label="Data de nascimento"
                error={errors.dateOfBirth?.message}
              />
            </div>

            <Input
              {...register('email')}
              type="email"
              label="E-mail"
              placeholder="seu.email@exemplo.com"
              error={errors.email?.message}
            />

            <Button
              type="button"
              size="lg"
              className="w-full mt-6 group"
              onClick={handleNextStep}
            >
              Próximo passo
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <Input
                {...register('password')}
                type="password"
                label="Senha"
                placeholder="••••••••"
                error={errors.password?.message}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              {passwordValue && (
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="flex gap-1 w-full max-w-[150px]">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                          passwordStrength.score >= level
                            ? passwordStrength.color
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-xs font-medium ${passwordStrength.color.replace(
                      'bg-',
                      'text-',
                    )}`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <Input
              {...register('confirmPassword')}
              type="password"
              label="Confirmar senha"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />

            <label className="flex items-start gap-3 mt-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="relative flex items-start mt-0.5">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500 cursor-pointer peer"
                />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                  Aceito os termos
                </p>
                <p className="text-gray-500">
                  Concordo com os Termos de Uso e a Política de Privacidade do
                  AprovaAI.
                </p>
              </div>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600 px-1">
                {errors.acceptTerms.message}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-1/3"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-2/3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loading size="xs" className="mr-2" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Criar conta
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <GoogleButton type="button" onClick={handleGoogleLogin}>
              Continuar com Google
            </GoogleButton>

            <div className="text-center pt-6 border-t border-gray-200 mt-6">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
