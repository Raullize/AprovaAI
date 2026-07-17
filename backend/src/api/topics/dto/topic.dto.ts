import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createTopicSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .describe('Nome da disciplina/tópico. Ex: "Matemática Financeira"'),
  description: z.string().optional().describe('Descrição opcional do tópico.'),
  order: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Ordem de exibição. Ex: 2'),
  status: z
    .enum(['PUBLISHED', 'DRAFT'])
    .default('PUBLISHED')
    .describe('Status de visibilidade'),
  showComingSoon: z
    .boolean()
    .default(false)
    .describe(
      'Quando ativo, o tópico pode aparecer para o aluno com um indicador de "em breve", mesmo sem níveis publicados.',
    ),
  examId: z
    .uuid('ID do exame inválido')
    .describe(
      'ID UUID da trilha principal à qual o tópico pertence. Ex: "123e4567-e89b-12d3-a456-426614174000"',
    ),
  iconKey: z.string().optional().describe('Chave do ícone. Ex: "book-open"'),
  colorScheme: z.string().optional().describe('Esquema de cor. Ex: "violet"'),
});

export class CreateTopicDto extends createZodDto(createTopicSchema) {}

export const updateTopicSchema = z.object({
  name: z
    .string()
    .optional()
    .describe('Novo nome da disciplina ou tópico. Ex: "Segurança em Cloud"'),
  description: z
    .string()
    .optional()
    .describe('Nova descrição opcional do tópico.'),
  status: z
    .enum(['PUBLISHED', 'DRAFT'])
    .optional()
    .describe('Novo status de visibilidade do tópico.'),
  showComingSoon: z
    .boolean()
    .optional()
    .describe(
      'Define se o tópico deve exibir o indicador de "em breve" para o aluno.',
    ),
  examId: z
    .uuid('ID do exame inválido')
    .optional()
    .describe(
      'Novo ID UUID da trilha principal à qual este tópico pertence. Ex: "123e4567-e89b-12d3-a456-426614174000"',
    ),
  iconKey: z
    .string()
    .nullable()
    .optional()
    .describe('Nova chave do ícone ou `null` para remover.'),
  colorScheme: z
    .string()
    .nullable()
    .optional()
    .describe('Novo esquema de cor ou `null` para limpar o valor.'),
});

export class UpdateTopicDto extends createZodDto(updateTopicSchema) {}
