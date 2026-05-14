import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createOptionSchema = z.object({
  text: z.string().min(1, 'Texto da opção é obrigatório'),
  isCorrect: z.boolean(),
});

const updateOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Texto da opção é obrigatório'),
  isCorrect: z.boolean(),
});

export const createQuestionSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  imageUrl: z.string().optional().nullable(),
  type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE']).default('MULTIPLE_CHOICE'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  explanation: z.string().optional().nullable(),
  studyLink: z.string().optional().nullable(),
  levelId: z.string().min(1, 'ID do nível é obrigatório'),
  options: z
    .array(createOptionSchema)
    .min(2, 'A questão deve ter pelo menos 2 opções'),
});

export class CreateQuestionDto extends createZodDto(createQuestionSchema) {}

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

export class UpdateQuestionDto extends createZodDto(updateQuestionSchema) {}
