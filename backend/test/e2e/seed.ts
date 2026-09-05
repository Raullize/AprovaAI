import { hash } from 'bcrypt';
import { prisma } from './helpers/testHelper';

const FUNCTIONAL_EMAIL_MARKER = 'functional';
const EXAM_FUNCTIONAL_SLUG = 'exame-funcional';

async function cleanSeedTargets() {
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
}

async function runSeed() {
  console.log('Iniciando preparacao da massa de dados funcionais...');

  try {
    await cleanSeedTargets();

    const studentPasswordHash = await hash('Student@123', 10);
    const adminPasswordHash = await hash('Admin@123', 10);

    const student = await prisma.user.create({
      data: {
        fullName: 'Estudante Funcional',
        username: 'estudante_funcional',
        email: 'estudante.functional@aprovaai.test',
        passwordHash: studentPasswordHash,
        dateOfBirth: new Date('1998-10-15T00:00:00Z'),
        role: 'STUDENT',
      },
    });

    const admin = await prisma.user.create({
      data: {
        fullName: 'Admin Funcional',
        username: 'admin_funcional',
        email: 'admin.functional@aprovaai.test',
        passwordHash: adminPasswordHash,
        dateOfBirth: new Date('1990-01-01T00:00:00Z'),
        role: 'ADMIN',
      },
    });

    const exam = await prisma.exam.create({
      data: {
        name: 'Exame Funcional',
        slug: EXAM_FUNCTIONAL_SLUG,
        description: 'Exame de teste funcional',
        status: 'PUBLISHED',
        category: 'OUTROS',
        order: 1,
      },
    });

    const topic = await prisma.topic.create({
      data: {
        name: 'Topico Funcional',
        slug: 'topico-funcional',
        description: 'Topico do exame funcional',
        status: 'PUBLISHED',
        order: 1,
        examId: exam.id,
      },
    });

    const simulation = await prisma.simulation.create({
      data: {
        name: 'Simulado Funcional',
        slug: 'simulado-funcional',
        description: 'Simulado do topico funcional',
        status: 'PUBLISHED',
        order: 1,
        xpReward: 100,
        passingPercentage: 70,
        timeLimit: 3600,
        simulationMode: 'PRACTICE',
        topicId: topic.id,
      },
    });

    const question = await prisma.question.create({
      data: {
        content: 'Qual e a resposta correta para o teste funcional?',
        type: 'SINGLE_CHOICE',
        status: 'PUBLISHED',
        order: 1,
        explanation: 'Explicacao da questao funcional',
        studyLink: 'http://study-link.test',
        simulationId: simulation.id,
      },
    });

    const correctOption = await prisma.option.create({
      data: {
        text: 'Alternativa Correta',
        isCorrect: true,
        order: 1,
        questionId: question.id,
      },
    });

    const incorrectOption = await prisma.option.create({
      data: {
        text: 'Alternativa Incorreta',
        isCorrect: false,
        order: 2,
        questionId: question.id,
      },
    });

    console.log('Massa de dados funcionais preparada com sucesso.');
    console.log('IDs funcionais:', {
      student: student.id,
      admin: admin.id,
      exam: exam.id,
      topic: topic.id,
      simulation: simulation.id,
      question: question.id,
      correctOption: correctOption.id,
      incorrectOption: incorrectOption.id,
    });

    process.exit(0);
  } catch (error) {
    console.error('Falha ao preparar a massa de dados funcionais:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void runSeed();
