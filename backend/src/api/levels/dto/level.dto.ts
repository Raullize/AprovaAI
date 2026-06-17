import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createLevelSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .describe('Nome do nível. Ex: "Nível 1 - Básico"'),
  description: z.string().optional().describe('Descrição opcional do nível.'),
  order: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Ordem de exibição do nível. Ex: 1'),
  xpReward: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('Quantidade de XP que o aluno ganha ao concluir o nível. Ex: 50'),
  passingPercentage: z
    .number()
    .min(0)
    .max(100)
    .default(70)
    .describe('Porcentagem mínima de acertos para aprovação. Ex: 70'),
  timeLimit: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Tempo limite em minutos para concluir o nível. Ex: 60'),
  simulationMode: z
    .enum(['PRACTICE', 'EXAM'])
    .default('PRACTICE')
    .describe(
      'Modo do simulado: PRACTICE (Feedback na hora) ou EXAM (Prova real)',
    ),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .default('ACTIVE')
    .describe('Status de visibilidade do nível'),
  topicId: z
    .string()
    .uuid('ID do tópico inválido')
    .describe('ID (UUID) do tópico ao qual este nível pertence.'),
});

export class CreateLevelDto extends createZodDto(createLevelSchema) {}

export const updateLevelSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  topicId: z.string().optional(),
  xpReward: z.number().int().optional(),
  passingPercentage: z.number().optional(),
  timeLimit: z.number().int().min(1).optional().nullable(),
  simulationMode: z.enum(['PRACTICE', 'EXAM']).optional(),
});

export class UpdateLevelDto extends createZodDto(updateLevelSchema) {}
