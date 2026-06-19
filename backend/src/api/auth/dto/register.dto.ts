import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nome deve ter entre 2 e 100 caracteres.')
    .max(100)
    .describe('Nome completo do aluno. Ex: Raul Lize'),
  username: z
    .string()
    .min(3, 'Usuário deve ter entre 3 e 30 caracteres.')
    .max(30)
    .describe('Nome de usuário único da conta. Ex: raullize'),
  email: z
    .string()
    .email('E-mail inválido')
    .describe('E-mail principal da conta. Ex: aluno@aprovaai.com'),
  password: z
    .string()
    .min(6, 'Senha deve ter entre 6 e 50 caracteres.')
    .max(50)
    .describe('Senha de acesso com no mínimo 6 caracteres. Ex: senha123'),
  dateOfBirth: z
    .string()
    .describe('Data de nascimento no formato ISO ou YYYY-MM-DD. Ex: 1998-10-15'),
});

export class RegisterDto extends createZodDto(registerSchema) {}
