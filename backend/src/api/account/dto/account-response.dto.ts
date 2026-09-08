import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const accountProfileResponseSchema = z.object({
  id: z.string().describe('Identificador único do usuário (UUID).'),
  fullName: z.string().describe('Nome completo do usuário.'),
  username: z.string().describe('Nome de usuário único.'),
  email: z.string().email().describe('E-mail de acesso do usuário.'),
  role: z
    .enum(['STUDENT', 'ADMIN'])
    .describe('Papel do usuário na plataforma.'),
  subscriptionPlan: z
    .enum(['FREE', 'PREMIUM'])
    .describe('Plano de assinatura atual.'),
  xp: z.number().describe('Total de XP acumulado.'),
  streakCount: z
    .number()
    .describe('Ofensiva atual (dias consecutivos de estudo).'),
  bestStreak: z.number().describe('Recorde de ofensiva já alcançado.'),
  lastActiveAt: z
    .string()
    .nullable()
    .optional()
    .describe('Data da última atividade (ISO 8601).'),
  avatarUrl: z
    .string()
    .nullable()
    .optional()
    .describe('URL da foto de perfil.'),
  createdAt: z.string().optional().describe('Data de criação (ISO 8601).'),
});

export class AccountProfileResponseDto extends createZodDto(
  accountProfileResponseSchema,
) {}
