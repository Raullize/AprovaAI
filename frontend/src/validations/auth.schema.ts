import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter entre 6 e 50 caracteres')
    .max(50, 'Senha deve ter entre 6 e 50 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Nome completo é obrigatório')
      .min(2, 'Nome deve ter entre 2 e 100 caracteres')
      .max(100, 'Nome deve ter entre 2 e 100 caracteres'),
    username: z
      .string()
      .min(1, 'Nome de usuário é obrigatório')
      .min(3, 'Usuário deve ter entre 3 e 30 caracteres')
      .max(30, 'Usuário deve ter entre 3 e 30 caracteres')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Usuário deve conter apenas letras, números e underline (_)',
      ),
    email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(6, 'Senha deve ter pelo menos 6 caracteres')
      .max(50, 'Senha deve ter no máximo 50 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    dateOfBirth: z
      .string()
      .min(1, 'Data de nascimento é obrigatória')
      .refine(
        (dateString) => {
          const date = new Date(dateString);
          const today = new Date();
          const age = today.getFullYear() - date.getFullYear();
          return age >= 13 && age <= 120;
        },
        {
          message: 'Idade deve estar entre 13 e 120 anos',
        },
      ),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'Você deve aceitar os termos de uso'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
