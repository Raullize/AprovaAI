import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const sendChatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Mensagem é obrigatória')
    .max(1000, 'Mensagem muito longa (máx. 1000 caracteres)')
    .describe('Mensagem do estudante para o Professor Sabichão.'),
});

export class SendChatMessageDto extends createZodDto(sendChatMessageSchema) {}

export const chatHistoryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(20)
    .describe('Quantidade máxima de mensagens retornadas.'),
});

export class ChatHistoryQueryDto extends createZodDto(chatHistoryQuerySchema) {}

export const chatReplyResponseSchema = z.object({
  reply: z.string().describe('Resposta do Professor Sabichão.'),
});

export class ChatReplyResponseDto extends createZodDto(
  chatReplyResponseSchema,
) {}

export const chatHistoryItemSchema = z.object({
  id: z.string().describe('Identificador da mensagem.'),
  role: z.enum(['USER', 'ASSISTANT']).describe('Autor da mensagem.'),
  content: z.string().describe('Conteúdo da mensagem.'),
  createdAt: z.string().describe('Data de criação (ISO 8601).'),
});

export class ChatHistoryItemDto extends createZodDto(chatHistoryItemSchema) {}
