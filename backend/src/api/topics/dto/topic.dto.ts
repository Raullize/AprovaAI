import { z } from 'zod';

export const createTopicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  examId: z.string().min(1, 'ID do exame é obrigatório'),
});

export type CreateTopicDto = z.infer<typeof createTopicSchema>;

export const updateTopicSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  examId: z.string().optional(),
});

export type UpdateTopicDto = z.infer<typeof updateTopicSchema>;
