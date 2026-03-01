// We'll use straight NestJS class-validator or just vanilla if we haven't set up pipes yet.
// Wait, we installed zod. So let's create a Zod schema.

import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;
