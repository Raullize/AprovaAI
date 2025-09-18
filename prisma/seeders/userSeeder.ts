import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@aprovaai.com' }
  });

  if (existingUser) {
    return existingUser;
  }

  const hashedPassword = await bcrypt.hash('demo123', 12);

  const demoUser = await prisma.user.create({
    data: {
      fullName: 'Usuário Demo',
      username: 'demo',
      email: 'demo@aprovaai.com',
      passwordHash: hashedPassword,
      role: 'USER',
      dateOfBirth: new Date('2002-02-02'),
      subscriptionPlan: 'FREE',
    },
  });
  
  return demoUser;
}

export async function cleanupUsers() {
  await prisma.user.deleteMany({
    where: { email: 'demo@aprovaai.com' }
  });
}
