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
  id: z
    .string()
    .optional()
    .describe('ID da alternativa existente. Omitir para criar uma nova opção.'),
  text: z
    .string()
    .min(1, 'Texto da opção é obrigatório')
    .describe('Novo texto da alternativa. Ex: "São Paulo"'),
  isCorrect: z
    .boolean()
    .describe('Indica se esta alternativa deve ser marcada como correta.'),
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
  content: z
    .string()
    .optional()
    .describe('Novo enunciado da questão.'),
  imageUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .nullable()
    .describe('Nova URL da imagem ilustrativa ou `null` para remover.'),
  type: z
    .enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE'])
    .optional()
    .describe('Novo tipo da questão.'),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .optional()
    .describe('Novo status de visibilidade da questão.'),
  explanation: z
    .string()
    .optional()
    .nullable()
    .describe('Nova explicação de apoio ao aluno ou `null` para remover.'),
  studyLink: z
    .string()
    .url('URL inválida')
    .optional()
    .nullable()
    .describe('Novo link de estudo complementar ou `null` para remover.'),
  levelId: z
    .string()
    .uuid('ID do nível inválido')
    .optional()
    .describe('Novo ID (UUID) do nível ao qual a questão pertence.'),
  options: z
    .array(updateOptionSchema)
    .optional()
    .describe('Lista completa de alternativas atualizadas da questão.'),
});

export class UpdateQuestionDto extends createZodDto(updateQuestionSchema) {}
