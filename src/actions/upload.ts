'use server'

import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function uploadImage(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('Nenhum arquivo enviado');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande (máx 5MB)');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = `${timestamp}-${randomString}.${extension}`;

  const uploadDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return { url: `/uploads/${fileName}` };
}

export async function deleteImage(fileName: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    // Validação básica para evitar path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        throw new Error('Nome de arquivo inválido');
    }

    const filePath = join(process.cwd(), 'public', 'uploads', fileName);
    
    try {
        if (existsSync(filePath)) {
            await unlink(filePath);
        }
        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar arquivo:', error);
        throw new Error('Erro ao deletar arquivo');
    }
}
