import { PrismaClient } from '@prisma/client';
import { seedAdmin, cleanupAdmin } from './adminSeeder';
import { seedUsers, cleanupUsers } from './userSeeder';

const prisma = new PrismaClient();

async function main() {
  try {
    await seedAdmin();
    await seedUsers();
  } catch (error) {
    console.error('Erro durante o processo de seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanup() {
  try {
    await cleanupUsers();
    await cleanupAdmin();
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