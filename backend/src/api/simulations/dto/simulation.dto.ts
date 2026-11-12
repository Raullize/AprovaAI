import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createSimulationSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .describe('Nome do simulado. Ex: "Simulado 1 - Básico"'),
  description: z
    .string()
    .optional()
    .describe('Descrição opcional do simulado.'),
  order: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Ordem de exibição do simulado. Ex: 1'),
  xpReward: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe(
      'Quantidade de XP que o aluno ganha ao concluir o simulado. Ex: 50',
    ),
  passingPercentage: z
    .number()
    .min(0)
    .max(100)
    .default(70)
    .describe('Porcentagem mínima de acertos para aprovação. Ex: 70'),
  timeLimit: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Tempo limite em minutos para concluir o simulado. Ex: 60'),
  simulationMode: z
    .enum(['PRACTICE', 'EXAM'])
    .default('PRACTICE')
    .describe(
      'Modo do simulado: PRACTICE (Feedback na hora) ou EXAM (Prova real)',
    ),
  status: z
    .enum(['PUBLISHED', 'DRAFT'])
    .default('PUBLISHED')
    .describe('Status de visibilidade do simulado'),
  topicId: z
    .uuid('ID do tópico inválido')
    .describe(
      'ID UUID do tópico ao qual este simulado pertence. Ex: "123e4567-e89b-12d3-a456-426614174000"',
    ),
});

export class CreateSimulationDto extends createZodDto(createSimulationSchema) {}

export const updateSimulationSchema = z.object({
  name: z
    .string()
    .optional()
    .describe('Novo nome do simulado. Ex: "Simulado 2 - Intermediário"'),
  description: z
    .string()
    .optional()
    .describe('Nova descrição opcional do simulado.'),
  status: z
    .enum(['PUBLISHED', 'DRAFT'])
    .optional()
    .describe('Novo status de visibilidade do simulado.'),
  topicId: z
    .uuid('ID do tópico inválido')
    .optional()
    .describe(
      'Novo ID UUID do tópico ao qual este simulado pertence. Ex: "123e4567-e89b-12d3-a456-426614174000"',
    ),
  xpReward: z
    .number()
    .int()
    .optional()
    .describe('Novo total de XP concedido ao concluir o simulado. Ex: 100'),
  passingPercentage: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Nova porcentagem mínima de acertos para aprovação. Ex: 80'),
  timeLimit: z
    .number()
    .int()
    .min(1)
    .optional()
    .nullable()
    .describe('Novo tempo limite em minutos ou `null` para remover. Ex: 45'),
  simulationMode: z
    .enum(['PRACTICE', 'EXAM'])
    .optional()
    .describe('Novo modo do simulado: PRACTICE ou EXAM.'),
});

export class UpdateSimulationDto extends createZodDto(updateSimulationSchema) {}

const generateSimulationBaseSchema = z.object({
  topicId: z
    .uuid('ID do tópico inválido')
    .describe('ID UUID do tópico onde o simulado será criado.'),
  count: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(10)
    .describe('Quantidade de questões a gerar (1 a 10).'),
  name: z
    .string()
    .min(3)
    .max(120)
    .optional()
    .describe('Nome opcional; se omitido, será gerado automaticamente.'),
  description: z
    .string()
    .max(500)
    .optional()
    .describe('Descrição opcional do simulado.'),
  xpReward: z.coerce
    .number()
    .int()
    .min(0)
    .default(100)
    .describe('XP concedido ao concluir o simulado.'),
  passingPercentage: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(70)
    .describe('Percentual mínimo de aprovação.'),
  timeLimit: z.coerce
    .number()
    .int()
    .min(1)
    .nullable()
    .optional()
    .describe('Tempo limite em minutos (opcional).'),
  simulationMode: z
    .enum(['PRACTICE', 'EXAM'])
    .default('PRACTICE')
    .describe('Modo do simulado.'),
});

export const generateSimulationSchema = generateSimulationBaseSchema.extend({
  source: z
    .enum(['ENEM', 'AI'])
    .describe('Fonte: ENEM (banco real) ou AI (questões geradas).'),
  discipline: z
    .enum(['ciencias-humanas', 'ciencias-natureza', 'linguagens', 'matematica'])
    .optional()
    .describe('Disciplina do ENEM (obrigatória quando source = ENEM).'),
  years: z
    .array(z.coerce.number().int().min(2009).max(2023))
    .min(1)
    .max(5)
    .optional()
    .describe(
      'Anos do ENEM, de 2009 a 2023 (obrigatório quando source = ENEM).',
    ),
  language: z
    .enum(['ingles', 'espanhol'])
    .optional()
    .describe('Idioma para questões de Linguagens (padrão: inglês).'),
  focus: z
    .string()
    .max(300)
    .optional()
    .describe('Tema ou foco opcional para a geração por IA.'),
});

export class GenerateSimulationDto extends createZodDto(
  generateSimulationSchema,
) {}
