import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const messageResponseSchema = z.object({
  message: z.string().describe('Mensagem descritiva do resultado da operação.'),
});

export class MessageResponseDto extends createZodDto(messageResponseSchema) {}
