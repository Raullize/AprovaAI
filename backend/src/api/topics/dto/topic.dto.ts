import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createTopicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  examId: z.string().min(1, 'ID do exame é obrigatório'),
});

export class CreateTopicDto extends createZodDto(createTopicSchema) {}

export const updateTopicSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  examId: z.string().optional(),
});

export class UpdateTopicDto extends createZodDto(updateTopicSchema) {}
