import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedAdmin() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@aprovaai.com' }
  });

  if (existingAdmin) {
    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Administrador Root',
      username: 'admin',
      email: 'admin@aprovaai.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      dateOfBirth: new Date('2002-02-02'),
      subscriptionPlan: 'FREE',
    },
  });
  
  return admin;
}

export async function cleanupAdmin() {
  await prisma.user.deleteMany({
    where: { email: 'admin@aprovaai.com' }
  });
}
