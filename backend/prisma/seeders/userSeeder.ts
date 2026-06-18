import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedUsers() {
  const hashedPassword = await bcrypt.hash('demo123', 12);
  const users = [
    {
      fullName: 'Usuário Demo',
      username: 'demo',
      email: 'demo@aprovaai.com',
      xp: 0,
    },
    {
      fullName: 'Ana Certificacoes',
      username: 'ana.cert',
      email: 'ana@aprovaai.com',
      xp: 80,
    },
    {
      fullName: 'Bruno Concursos',
      username: 'bruno.concursos',
      email: 'bruno@aprovaai.com',
      xp: 160,
    },
    {
      fullName: 'Carla Flashcards',
      username: 'carla.flash',
      email: 'carla@aprovaai.com',
      xp: 245,
    },
    {
      fullName: 'Diego Simulados',
      username: 'diego.simulados',
      email: 'diego@aprovaai.com',
      xp: 390,
    },
    {
      fullName: 'Elisa Ranking',
      username: 'elisa.ranking',
      email: 'elisa@aprovaai.com',
      xp: 520,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        username: user.username,
        xp: user.xp,
        passwordHash: hashedPassword,
        role: 'USER',
        dateOfBirth: new Date('2000-01-01'),
        subscriptionPlan: 'FREE',
      },
      create: {
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        passwordHash: hashedPassword,
        role: 'USER',
        dateOfBirth: new Date('2000-01-01'),
        subscriptionPlan: 'FREE',
        xp: user.xp,
      },
    });
  }

  console.log(
    'Usuários seeded: demo@aprovaai.com, ana@aprovaai.com, bruno@aprovaai.com, carla@aprovaai.com, diego@aprovaai.com, elisa@aprovaai.com / senha demo123',
  );

  return prisma.user.findUnique({
    where: { email: 'demo@aprovaai.com' },
  });
}
