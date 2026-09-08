import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const examResponseSchema = z.object({
  id: z.string().describe('Identificador único do exame (UUID).'),
  name: z.string().describe('Nome da trilha principal.'),
  slug: z.string().describe('Slug único do exame.'),
  description: z
    .string()
    .nullable()
    .optional()
    .describe('Descrição detalhada.'),
  status: z.enum(['PUBLISHED', 'DRAFT']).describe('Status de visibilidade.'),
  order: z.number().describe('Ordem de exibição.'),
  topicsCount: z.number().describe('Quantidade de tópicos vinculados.'),
  iconKey: z.string().nullable().optional().describe('Chave do ícone Lucide.'),
  colorScheme: z.string().nullable().optional().describe('Esquema de cor.'),
  category: z.string().nullable().optional().describe('Categoria do exame.'),
  createdAt: z.string().optional().describe('Data de criação (ISO 8601).'),
  updatedAt: z
    .string()
    .optional()
    .describe('Data da última atualização (ISO 8601).'),
});

export const topicResponseSchema = z.object({
  id: z.string().describe('Identificador único do tópico (UUID).'),
  name: z.string().describe('Nome da disciplina/tópico.'),
  slug: z.string().describe('Slug único do tópico.'),
  description: z
    .string()
    .nullable()
    .optional()
    .describe('Descrição detalhada.'),
  status: z.enum(['PUBLISHED', 'DRAFT']).describe('Status de visibilidade.'),
  showComingSoon: z
    .boolean()
    .optional()
    .describe('Indica se o tópico exibe o selo "em breve".'),
  examId: z.string().describe('ID do exame ao qual o tópico pertence (UUID).'),
  order: z.number().describe('Ordem de exibição.'),
  simulationsCount: z.number().describe('Quantidade de simulados vinculados.'),
  iconKey: z.string().nullable().optional().describe('Chave do ícone Lucide.'),
  colorScheme: z.string().nullable().optional().describe('Esquema de cor.'),
  createdAt: z.string().optional().describe('Data de criação (ISO 8601).'),
  updatedAt: z
    .string()
    .optional()
    .describe('Data da última atualização (ISO 8601).'),
});

export const simulationResponseSchema = z.object({
  id: z.string().describe('Identificador único do simulado (UUID).'),
  name: z.string().describe('Nome do simulado.'),
  slug: z.string().describe('Slug único do simulado.'),
  description: z
    .string()
    .nullable()
    .optional()
    .describe('Descrição detalhada.'),
  order: z.number().describe('Ordem de exibição.'),
  topicId: z
    .string()
    .describe('ID do tópico ao qual o simulado pertence (UUID).'),
  status: z.enum(['PUBLISHED', 'DRAFT']).describe('Status de visibilidade.'),
  xpReward: z.number().describe('XP concedido ao concluir o simulado.'),
  passingPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('Porcentagem mínima para aprovação.'),
  timeLimit: z
    .number()
    .nullable()
    .optional()
    .describe('Tempo limite em segundos.'),
  simulationMode: z
    .enum(['PRACTICE', 'EXAM'])
    .describe('Modo do simulado (PRACTICE ou EXAM).'),
  questionsCount: z.number().describe('Quantidade de questões vinculadas.'),
  createdAt: z.string().optional().describe('Data de criação (ISO 8601).'),
  updatedAt: z
    .string()
    .optional()
    .describe('Data da última atualização (ISO 8601).'),
});

export const questionOptionResponseSchema = z.object({
  id: z.string().describe('Identificador único da alternativa (UUID).'),
  text: z.string().describe('Texto da alternativa.'),
  isCorrect: z.boolean().describe('Indica se é a alternativa correta.'),
  order: z.number().describe('Ordem de exibição.'),
});

export const questionResponseSchema = z.object({
  id: z.string().describe('Identificador único da questão (UUID).'),
  content: z.string().describe('Enunciado da questão.'),
  imageUrl: z
    .string()
    .nullable()
    .optional()
    .describe('URL de imagem ilustrativa.'),
  type: z
    .enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE'])
    .describe('Tipo da questão.'),
  status: z.enum(['PUBLISHED', 'DRAFT']).describe('Status de visibilidade.'),
  order: z.number().describe('Ordem de exibição.'),
  explanation: z
    .string()
    .nullable()
    .optional()
    .describe('Explicação de apoio.'),
  studyLink: z
    .string()
    .nullable()
    .optional()
    .describe('Link de material de estudo.'),
  simulationId: z.string().describe('ID do simulado ao qual pertence (UUID).'),
  options: z
    .array(questionOptionResponseSchema)
    .describe('Lista de alternativas da questão.'),
  createdAt: z.string().optional().describe('Data de criação (ISO 8601).'),
  updatedAt: z
    .string()
    .optional()
    .describe('Data da última atualização (ISO 8601).'),
});

export class ExamResponseDto extends createZodDto(examResponseSchema) {}
export class TopicResponseDto extends createZodDto(topicResponseSchema) {}
export class SimulationResponseDto extends createZodDto(
  simulationResponseSchema,
) {}
export class QuestionResponseDto extends createZodDto(questionResponseSchema) {}
