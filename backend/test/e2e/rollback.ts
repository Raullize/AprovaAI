import { prisma } from './helpers/testHelper';

const FUNCTIONAL_EMAIL_MARKER = 'functional';
const EXAM_FUNCTIONAL_SLUG = 'exame-funcional';

async function runRollback() {
  console.log('Iniciando limpeza da base de dados funcional...');

  try {
    const emailFilter = { contains: FUNCTIONAL_EMAIL_MARKER };

    await prisma.attemptAnswer.deleteMany({
      where: { simulationAttempt: { user: { email: emailFilter } } },
    });

    await prisma.simulationAttempt.deleteMany({
      where: { user: { email: emailFilter } },
    });

    await prisma.userActivity.deleteMany({
      where: { user: { email: emailFilter } },
    });

    await prisma.user.deleteMany({
      where: { email: emailFilter },
    });

    await prisma.exam.deleteMany({
      where: { slug: EXAM_FUNCTIONAL_SLUG },
    });

    console.log('Base funcional restaurada para o estado inicial.');
    process.exit(0);
  } catch (error) {
    console.error('Falha ao restaurar a base funcional:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void runRollback();
