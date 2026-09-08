import {
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('POST /simulation-attempts/:id/finish', () => {
  let studentToken: string;
  let simulationId: string;
  let questionId: string;
  let correctOptionId: string;
  let simulationAttemptId: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;

    const simulation = await prisma.simulation.findFirst({
      where: { slug: 'simulado-funcional' },
    });
    if (!simulation) throw new Error('Seed funcional nao preparou simulado');
    simulationId = simulation.id;

    const question = await prisma.question.findFirst({
      where: { simulationId: simulation.id },
    });
    if (!question) throw new Error('Seed funcional nao preparou questao');
    questionId = question.id;

    const correctOption = await prisma.option.findFirst({
      where: { questionId: question.id, isCorrect: true },
    });
    if (!correctOption) {
      throw new Error('Seed funcional nao preparou alternativa correta');
    }
    correctOptionId = correctOption.id;
  });

  beforeEach(async () => {
    const response = await createPostRequestWithAuth(
      '/simulation-attempts/start',
      { simulationId },
      studentToken,
    );
    simulationAttemptId = response.body.id;
  });

  it('deve finalizar o simulado e calcular o desempenho obtido', async () => {
    await createPostRequestWithAuth(
      `/simulation-attempts/${simulationAttemptId}/answers`,
      {
        questionId,
        selectedOptions: [correctOptionId],
        timeSpent: 20,
      },
      studentToken,
    );

    const response = await createPostRequestWithAuth(
      `/simulation-attempts/${simulationAttemptId}/finish`,
      { timeSpent: 20 },
      studentToken,
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('xpGained');
    expect(response.body.simulationAttempt.status).toBe('COMPLETED');
    expect(response.body.simulationAttempt.passed).toBe(true);
    expect(response.body.simulationAttempt.score).toBe(1);
  });
});
