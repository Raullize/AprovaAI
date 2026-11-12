import {
  createGetRequest,
  createGetRequestWithAuth,
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('GET /ai/attempts/:attemptId/chat/history', () => {
  let studentToken: string;
  let simulationId: string;
  let questionId: string;
  let correctOptionId: string;
  let inProgressAttemptId: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;

    const simulation = await prisma.simulation.findFirst({
      where: { slug: 'simulado-funcional' },
    });
    if (!simulation) {
      throw new Error('Seed funcional nao preparou o simulado');
    }
    simulationId = simulation.id;

    const question = await prisma.question.findFirst({
      where: { simulationId: simulation.id },
    });
    if (!question) {
      throw new Error('Seed funcional nao preparou a questao');
    }
    questionId = question.id;

    const correctOption = await prisma.option.findFirst({
      where: { questionId: question.id, isCorrect: true },
    });
    if (!correctOption) {
      throw new Error('Seed funcional nao preparou a alternativa correta');
    }
    correctOptionId = correctOption.id;
  });

  beforeEach(async () => {
    const response = await createPostRequestWithAuth(
      '/simulation-attempts/start',
      { simulationId },
      studentToken,
    );
    inProgressAttemptId = response.body.id;
  });

  it('deve retornar 401 sem autenticacao', async () => {
    const response = await createGetRequest(
      `/ai/attempts/${inProgressAttemptId}/chat/history`,
    );

    expect(response.status).toBe(401);
  });

  it('deve retornar 409 quando a tentativa ainda nao foi concluida', async () => {
    const response = await createGetRequestWithAuth(
      `/ai/attempts/${inProgressAttemptId}/chat/history`,
      studentToken,
    );

    expect(response.status).toBe(409);
  });

  it('deve retornar 404 para tentativa inexistente', async () => {
    const response = await createGetRequestWithAuth(
      '/ai/attempts/00000000-0000-0000-0000-000000000000/chat/history',
      studentToken,
    );

    expect(response.status).toBe(404);
  });

  it('deve retornar o historico da tentativa concluida', async () => {
    await createPostRequestWithAuth(
      `/simulation-attempts/${inProgressAttemptId}/answers`,
      {
        questionId,
        selectedOptions: [correctOptionId],
        timeSpent: 20,
      },
      studentToken,
    );

    await createPostRequestWithAuth(
      `/simulation-attempts/${inProgressAttemptId}/finish`,
      { timeSpent: 20 },
      studentToken,
    );

    await createPostRequestWithAuth(
      `/ai/attempts/${inProgressAttemptId}/chat`,
      { message: 'Explique a questao 1.' },
      studentToken,
    );

    const response = await createGetRequestWithAuth(
      `/ai/attempts/${inProgressAttemptId}/chat/history`,
      studentToken,
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body[0]).toHaveProperty('role');
    expect(response.body[0]).toHaveProperty('content');
    expect(response.body[0]).toHaveProperty('createdAt');
  });
});
