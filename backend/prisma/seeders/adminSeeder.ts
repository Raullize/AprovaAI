import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@aprovaai.com' }
  });

  if (existingAdmin) {
    console.log('Admin já existe.');
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
      dateOfBirth: new Date('2000-01-01'),
      subscriptionPlan: 'FREE',
      xp: 0
    },
  });

  console.log('Admin criado: admin@aprovaai.com / admin123');
  return admin;
}
