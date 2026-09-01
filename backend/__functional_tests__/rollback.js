const { prisma } = require("./src/functionalTestHelper");

async function runRollback() {
  console.log("Iniciando limpeza da base de dados funcional...");

  try {
    // Apagar respostas, resultados e atividades dos usuarios funcionais
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

    // Apagar os usuarios funcionais
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "functional"
        }
      }
    });

    // Apagar o exame funcional (cascade remove topicos, niveis, questoes e alternativas)
    await prisma.exam.deleteMany({
      where: {
        slug: "exame-funcional"
      }
    });

    console.log("Base funcional restaurada para o estado inicial.");
    process.exit(0);
  } catch (error) {
    console.error("Falha ao restaurar a base funcional:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runRollback();
