import { PrismaClient } from '@prisma/client';
import { seedAwsContent } from './awsContentSeeder';
import { seedEnemContent } from './enemContentSeeder';

const prisma = new PrismaClient();

export async function seedContent() {
  console.log('Limpando dados de exames anteriores...');
  await prisma.exam.deleteMany({});

  console.log('Populando dados de exames, topicos, niveis e questoes...');
  await seedAwsContent(prisma);
  await seedEnemContent(prisma);

  console.log(
    '✓ Seed finalizado: 2 exames, 7 topicos, 16 niveis, 160 questoes + historico demo.',
  );
}
