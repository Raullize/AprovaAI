import { z } from 'zod';

export const createExamSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type CreateExamDto = z.infer<typeof createExamSchema>;

export const updateExamSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type UpdateExamDto = z.infer<typeof updateExamSchema>;

export const reorderSchema = z.object({
    ids: z.array(z.string()).min(1, 'ids deve ser um array com pelo menos 1 item'),
});

export type ReorderDto = z.infer<typeof reorderSchema>;
