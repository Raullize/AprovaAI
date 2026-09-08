import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createExamSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .describe('Nome da trilha principal. Ex: "Concurso Banco do Brasil 2025"'),
  description: z
    .string()
    .optional()
    .describe('Descrição detalhada do concurso ou exame.'),
  status: z
    .enum(['PUBLISHED', 'DRAFT'])
    .default('PUBLISHED')
    .describe('Controla se os alunos podem ver e acessar este exame.'),
  iconKey: z
    .string()
    .optional()
    .describe('Chave do ícone Lucide. Ex: "trophy"'),
  colorScheme: z.string().optional().describe('Esquema de cor. Ex: "indigo"'),
  category: z
    .enum(['CONCURSOS', 'CERTIFICACOES', 'VESTIBULAR', 'OAB', 'OUTROS'])
    .default('OUTROS')
    .describe('Categoria do exame.'),
});

export class CreateExamDto extends createZodDto(createExamSchema) {}

export const updateExamSchema = z.object({
  name: z
    .string()
    .optional()
    .describe('Novo nome da trilha principal. Ex: "Concurso Caixa 2025"'),
  description: z
    .string()
    .optional()
    .describe('Nova descrição detalhada do exame ou trilha.'),
  status: z
    .enum(['PUBLISHED', 'DRAFT'])
    .optional()
    .describe('Controla se o exame continua visível para os alunos.'),
  iconKey: z
    .string()
    .nullable()
    .optional()
    .describe('Nova chave do ícone Lucide ou `null` para remover.'),
  colorScheme: z
    .string()
    .nullable()
    .optional()
    .describe('Novo esquema de cor ou `null` para limpar o valor.'),
  category: z
    .enum(['CONCURSOS', 'CERTIFICACOES', 'VESTIBULAR', 'OAB', 'OUTROS'])
    .nullable()
    .optional()
    .describe('Nova categoria do exame ou `null` para remover a categoria.'),
});

export class UpdateExamDto extends createZodDto(updateExamSchema) {}

export const reorderSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, 'ids deve ser um array com pelo menos 1 item')
    .describe(
      'Array ordenado com os IDs dos registros na nova sequência de exibição.',
    ),
});

export class ReorderDto extends createZodDto(reorderSchema) {}
