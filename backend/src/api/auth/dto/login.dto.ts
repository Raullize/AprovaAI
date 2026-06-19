import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('E-mail inválido')
    .describe('E-mail cadastrado do usuário. Ex: aluno@aprovaai.com'),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .describe('Senha de acesso da conta. Ex: senha123'),
});

export class LoginDto extends createZodDto(loginSchema) {}
