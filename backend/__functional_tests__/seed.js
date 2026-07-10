const { prisma } = require("./src/functionalTestHelper");
const bcrypt = require("../node_modules/bcrypt");

async function runSeed() {
  console.log("Iniciando preparacao da massa de dados funcionais...");

  try {
    // Limpeza de massa de dados anterior para garantir idempotencia
    await prisma.examAnswer.deleteMany({
      where: {
        examResult: {
          user: {
            email: {
              contains: "functional"
            }
          }
        }
      }
    });

    await prisma.examResult.deleteMany({
      where: {
        user: {
          email: {
            contains: "functional"
          }
        }
      }
    });

    await prisma.userActivity.deleteMany({
      where: {
        user: {
          email: {
            contains: "functional"
          }
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "functional"
        }
      }
    });

    await prisma.exam.deleteMany({
      where: {
        slug: "exame-funcional"
      }
    });

    // Hash das senhas
    const studentPasswordHash = await bcrypt.hash("Student@123", 10);
    const adminPasswordHash = await bcrypt.hash("Admin@123", 10);

    // Criar usuarios de teste
    const student = await prisma.user.create({
      data: {
        fullName: "Estudante Funcional",
        username: "estudante_funcional",
        email: "estudante.functional@aprovaai.test",
        passwordHash: studentPasswordHash,
        dateOfBirth: new Date("1998-10-15T00:00:00Z"),
        role: "USER"
      }
    });

    const admin = await prisma.user.create({
      data: {
        fullName: "Admin Funcional",
        username: "admin_funcional",
        email: "admin.functional@aprovaai.test",
        passwordHash: adminPasswordHash,
        dateOfBirth: new Date("1990-01-01T00:00:00Z"),
        role: "ADMIN"
      }
    });

    // Criar Exame, Topico, Nivel, Questao e Alternativas
    const exam = await prisma.exam.create({
      data: {
        name: "Exame Funcional",
        slug: "exame-funcional",
        description: "Exame de teste funcional",
        status: "ACTIVE",
        category: "OUTROS",
        order: 1
      }
    });

    const topic = await prisma.topic.create({
      data: {
        name: "Topico Funcional",
        slug: "topico-funcional",
        description: "Topico do exame funcional",
        status: "ACTIVE",
        order: 1,
        examId: exam.id
      }
    });

    const level = await prisma.level.create({
      data: {
        name: "Nivel Funcional",
        slug: "nivel-funcional",
        description: "Nivel do topico funcional",
        status: "ACTIVE",
        order: 1,
        xpReward: 100,
        passingPercentage: 70.0,
        timeLimit: 3600,
        simulationMode: "PRACTICE",
        topicId: topic.id
      }
    });

    const question = await prisma.question.create({
      data: {
        content: "Qual e a resposta correta para o teste funcional?",
        type: "SINGLE_CHOICE",
        status: "ACTIVE",
        order: 1,
        explanation: "Explicacao da questao funcional",
        studyLink: "http://study-link.test",
        levelId: level.id
      }
    });

    const correctOption = await prisma.option.create({
      data: {
        text: "Alternativa Correta",
        isCorrect: true,
        order: 1,
        questionId: question.id
      }
    });

    const incorrectOption = await prisma.option.create({
      data: {
        text: "Alternativa Incorreta",
        isCorrect: false,
        order: 2,
        questionId: question.id
      }
    });

    console.log("Massa de dados funcionais preparada com sucesso.");
    process.exit(0);
  } catch (error) {
    console.error("Falha ao preparar a massa de dados funcionais:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSeed();
