import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@aprovaai.com' }
  });

  if (existingUser) {
    console.log('Usuário Demo já existe.');
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
      dateOfBirth: new Date('2000-01-01'),
      subscriptionPlan: 'FREE',
      xp: 0
    },
  });
  
  console.log('Usuário Demo criado: demo@aprovaai.com / demo123');
  return demoUser;
}
