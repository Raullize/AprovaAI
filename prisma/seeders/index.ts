import { PrismaClient } from '@prisma/client';
import { seedAdmin, cleanupAdmin } from './adminSeeder';
import { seedUsers, cleanupUsers } from './userSeeder';

const prisma = new PrismaClient();

async function main() {

  
  try {
    // Executar seeders
    await seedAdmin();
    await seedUsers();
    

  } catch (error) {
    console.error('Erro durante o processo de seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Função para limpar todos os dados
async function cleanup() {

  
  try {
    await cleanupAdmin();
    await cleanupUsers();
    

  } catch (error) {
    console.error('Erro durante a limpeza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar baseado no argumento da linha de comando
const command = process.argv[2];

if (command === 'cleanup') {
  cleanup();
} else {
  main();
}

export { main as seed, cleanup };