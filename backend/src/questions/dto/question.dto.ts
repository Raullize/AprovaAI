import { z } from 'zod';

export const createOptionSchema = z.object({
    text: z.string().min(1, 'Texto da opção é obrigatório'),
    isCorrect: z.boolean(),
});

export const updateOptionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Texto da opção é obrigatório').optional(),
    isCorrect: z.boolean().optional(),
});

export const createQuestionSchema = z.object({
    content: z.string().min(1, 'Conteúdo é obrigatório'),
    imageUrl: z.string().optional().nullable(),
    type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE']).default('MULTIPLE_CHOICE'),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    explanation: z.string().optional().nullable(),
    studyLink: z.string().optional().nullable(),
    levelId: z.string().min(1, 'ID do nível é obrigatório'),
    options: z.array(createOptionSchema).min(2, 'A questão deve ter pelo menos 2 opções'),
});

export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;

export const updateQuestionSchema = z.object({
    content: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
    type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    explanation: z.string().optional().nullable(),
    studyLink: z.string().optional().nullable(),
    levelId: z.string().optional(),
    options: z.array(updateOptionSchema).optional(),
});

export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
