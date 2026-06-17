import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createOptionSchema = z.object({
  text: z
    .string()
    .min(1, 'Texto da opção é obrigatório')
    .describe('Texto da alternativa. Ex: "Brasília"'),
  isCorrect: z
    .boolean()
    .default(false)
    .describe('Indica se esta é a alternativa correta.'),
});

const updateOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Texto da opção é obrigatório'),
  isCorrect: z.boolean(),
});

export const createQuestionSchema = z.object({
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .describe(
      'Texto ou enunciado da questão. Ex: "Qual é a capital do Brasil?"',
    ),
  imageUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .nullable()
    .describe('Link opcional para uma imagem ilustrativa da questão.'),
  type: z
    .enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE'])
    .default('MULTIPLE_CHOICE')
    .describe('Tipo da questão (Múltipla escolha ou escolha única)'),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .default('ACTIVE')
    .describe('Status de visibilidade da questão'),
  explanation: z
    .string()
    .optional()
    .nullable()
    .describe(
      'Texto explicativo para ajudar o aluno a entender a resposta correta.',
    ),
  studyLink: z
    .string()
    .url('URL inválida')
    .optional()
    .nullable()
    .describe('Link externo para um material de estudo complementar.'),
  levelId: z
    .string()
    .uuid('ID do nível inválido')
    .describe('ID (UUID) do nível ao qual esta questão pertence.'),
  options: z
    .array(createOptionSchema)
    .min(2, 'A questão deve ter pelo menos 2 opções')
    .describe('Array de alternativas da questão.'),
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
