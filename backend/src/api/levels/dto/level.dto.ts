import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createLevelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  topicId: z.string().min(1, 'ID do tópico é obrigatório'),
  xpReward: z.number().int().min(0).default(0),
  passingPercentage: z.number().min(0).max(100).default(70.0),
});

export class CreateLevelDto extends createZodDto(createLevelSchema) {}

export const updateLevelSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  topicId: z.string().optional(),
  xpReward: z.number().int().optional(),
  passingPercentage: z.number().optional(),
});

export class UpdateLevelDto extends createZodDto(updateLevelSchema) {}
