import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './adminSeeder';
import { seedUsers } from './userSeeder';
import { seedContent } from './contentSeeder';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando processo de seed...');
    await seedAdmin();
    await seedUsers();
    await seedContent();
    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
