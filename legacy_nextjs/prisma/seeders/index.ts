import { PrismaClient } from '@prisma/client';
import { seedAdmin, cleanupAdmin } from './adminSeeder';
import { seedUsers, cleanupUsers } from './userSeeder';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando processo de seed...');
    await seedAdmin();
    await seedUsers();
    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanup() {
  try {
    console.log('Iniciando limpeza dos dados...');
    await cleanupUsers();
    await cleanupAdmin();
    console.log('Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a limpeza:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv.includes('--cleanup')) {
  cleanup();
} else {
  main();
}

export { main as seed, cleanup };
