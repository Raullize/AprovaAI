import {
  createGetRequestWithAuth,
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('POST /ai/attempts/:attemptId/chat', () => {
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

  it('deve retornar 401 ao conversar sem autenticacao', async () => {
    const response = await createPostRequest(
      `/ai/attempts/${inProgressAttemptId}/chat`,
      { message: 'Ola' },
    );

    expect(response.status).toBe(401);
  });

  it('deve retornar 400 para identificador de tentativa invalido', async () => {
    const response = await createPostRequestWithAuth(
      '/ai/attempts/not-a-uuid/chat',
      { message: 'Ola' },
      studentToken,
    );

    expect(response.status).toBe(400);
  });

  it('deve retornar 404 para tentativa inexistente', async () => {
    const response = await createPostRequestWithAuth(
      '/ai/attempts/00000000-0000-0000-0000-000000000000/chat',
      { message: 'Ola' },
      studentToken,
    );

    expect(response.status).toBe(404);
  });

  it('deve retornar 409 ao conversar sobre tentativa em andamento', async () => {
    const response = await createPostRequestWithAuth(
      `/ai/attempts/${inProgressAttemptId}/chat`,
      { message: 'Por que errei?' },
      studentToken,
    );

    expect(response.status).toBe(409);
  });

  it('deve responder com contexto e persistir o historico por tentativa', async () => {
    await createPostRequestWithAuth(
      `/simulation-attempts/${inProgressAttemptId}/answers`,
      {
        questionId,
        selectedOptions: [correctOptionId],
        timeSpent: 20,
      },
      studentToken,
    );

    const finishResponse = await createPostRequestWithAuth(
      `/simulation-attempts/${inProgressAttemptId}/finish`,
      { timeSpent: 20 },
      studentToken,
    );
    expect(finishResponse.status).toBe(201);
    expect(finishResponse.body.simulationAttempt.status).toBe('COMPLETED');

    const message = 'Gere um relatorio do meu desempenho neste simulado.';
    const response = await createPostRequestWithAuth(
      `/ai/attempts/${inProgressAttemptId}/chat`,
      { message },
      studentToken,
    );

    expect(response.status).toBe(201);
    expect(typeof response.body.reply).toBe('string');
    expect(response.body.reply.length).toBeGreaterThan(0);

    const history = await createGetRequestWithAuth(
      `/ai/attempts/${inProgressAttemptId}/chat/history`,
      studentToken,
    );

    expect(history.status).toBe(200);
    expect(Array.isArray(history.body)).toBe(true);
    const contents = history.body.map(
      (item: { content: string }) => item.content,
    );
    expect(contents).toContain(message);
    expect(contents).toContain(response.body.reply);

    const globalHistory = await createGetRequestWithAuth(
      '/ai/chat/history',
      studentToken,
    );
    expect(globalHistory.status).toBe(200);
    const globalContents = globalHistory.body.map(
      (item: { content: string }) => item.content,
    );
    expect(globalContents).not.toContain(message);
  });
});
