'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    return await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        subscriptionPlan: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
}

const updateUserSchema = z.object({
    id: z.string(),
    subscriptionPlan: z.enum(['FREE', 'PREMIUM']).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
});

export async function updateUser(data: z.infer<typeof updateUserSchema>) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const { id, ...updateData } = updateUserSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }
    
    if (existingUser.role === 'ADMIN' && existingUser.id !== session.user.id) {
       throw new Error('Não é possível alterar dados de outros administradores');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        subscriptionPlan: true,
        role: true,
        updatedAt: true
      }
    });

    revalidatePath('/admin/users');
    return updatedUser;
}

export async function deleteUser(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
        throw new Error('Usuário não encontrado');
    }
    
    if (existingUser.role === 'ADMIN') {
        throw new Error('Não é possível deletar administradores');
    }

    await prisma.user.delete({
      where: { id }
    });

    revalidatePath('/admin/users');
    return { success: true };
}
