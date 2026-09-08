import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const userSummarySchema = z.object({
  id: z.string().describe('Identificador único do usuário (UUID).'),
  fullName: z.string().describe('Nome completo do usuário.'),
  username: z.string().describe('Nome de usuário único.'),
  email: z.string().email().describe('E-mail de acesso do usuário.'),
  dateOfBirth: z.string().describe('Data de nascimento (ISO 8601).'),
  role: z
    .enum(['STUDENT', 'ADMIN'])
    .describe('Papel do usuário na plataforma.'),
  subscriptionPlan: z
    .enum(['FREE', 'PREMIUM'])
    .describe('Plano de assinatura atual.'),
  xp: z.number().describe('Total de XP acumulado.'),
  createdAt: z.string().optional().describe('Data de criação (ISO 8601).'),
  updatedAt: z
    .string()
    .optional()
    .describe('Data da última atualização (ISO 8601).'),
});

export const loginResponseSchema = z.object({
  user: userSummarySchema.describe('Dados do usuário autenticado.'),
  token: z.string().describe('Token JWT (Bearer) para autenticação.'),
});

export const registerResponseSchema = userSummarySchema;

export class LoginResponseDto extends createZodDto(loginResponseSchema) {}
export class RegisterResponseDto extends createZodDto(registerResponseSchema) {}
