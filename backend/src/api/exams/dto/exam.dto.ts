import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createExamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
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
