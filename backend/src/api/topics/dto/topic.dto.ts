import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createTopicSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .describe('Nome da disciplina/tópico. Ex: "Matemática Financeira"'),
  description: z.string().optional().describe('Descrição opcional do tópico.'),
  order: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Ordem de exibição. Ex: 2'),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .default('ACTIVE')
    .describe('Status de visibilidade'),
  examId: z
    .string()
    .uuid('ID do exame inválido')
    .describe('ID (UUID) da trilha principal a qual pertence. Ex: 123e4567...'),
});

export class CreateTopicDto extends createZodDto(createTopicSchema) {}

export const updateTopicSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  examId: z.string().optional(),
});

export class UpdateTopicDto extends createZodDto(updateTopicSchema) {}
