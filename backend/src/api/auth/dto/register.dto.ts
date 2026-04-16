import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nome deve ter entre 2 e 100 caracteres.')
    .max(100),
  username: z
    .string()
    .min(3, 'Usuário deve ter entre 3 e 30 caracteres.')
    .max(30),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter entre 6 e 50 caracteres.')
    .max(50),
  dateOfBirth: z.string(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
