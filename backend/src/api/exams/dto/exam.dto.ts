import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createExamSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .describe('Nome da trilha principal. Ex: "Concurso Banco do Brasil 2025"'),
  description: z
    .string()
    .optional()
    .describe('Descrição detalhada do concurso ou exame.'),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .default('ACTIVE')
    .describe('Controla se os alunos podem ver e acessar este exame.'),
});

export class CreateExamDto extends createZodDto(createExamSchema) {}

export const updateExamSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class UpdateExamDto extends createZodDto(updateExamSchema) {}

export const reorderSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, 'ids deve ser um array com pelo menos 1 item'),
});

export class ReorderDto extends createZodDto(reorderSchema) {}
