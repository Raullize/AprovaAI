import {
  createDeleteRequestWithAuth,
  createGetRequestWithAuth,
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('DELETE /ai/attempts/:attemptId/chat/history', () => {
  let studentToken: string;
  let simulationId: string;
  let questionId: string;
  let correctOptionId: string;

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

  it('deve retornar 409 ao tentar apagar historico de tentativa em andamento', async () => {
    const start = await createPostRequestWithAuth(
      '/simulation-attempts/start',
      { simulationId },
      studentToken,
    );

    const response = await createDeleteRequestWithAuth(
      `/ai/attempts/${start.body.id}/chat/history`,
      studentToken,
    );

    expect(response.status).toBe(409);
  });

  it('deve retornar 404 para tentativa inexistente', async () => {
    const response = await createDeleteRequestWithAuth(
      '/ai/attempts/00000000-0000-0000-0000-000000000000/chat/history',
      studentToken,
    );

    expect(response.status).toBe(404);
  });

  it('deve apagar o historico da tentativa concluida', async () => {
    const start = await createPostRequestWithAuth(
      '/simulation-attempts/start',
      { simulationId },
      studentToken,
    );
    const attemptId = start.body.id;

    await createPostRequestWithAuth(
      `/simulation-attempts/${attemptId}/answers`,
      {
        questionId,
        selectedOptions: [correctOptionId],
        timeSpent: 20,
      },
      studentToken,
    );

    await createPostRequestWithAuth(
      `/simulation-attempts/${attemptId}/finish`,
      { timeSpent: 20 },
      studentToken,
    );

    await createPostRequestWithAuth(
      `/ai/attempts/${attemptId}/chat`,
      { message: 'Explique a questao 1.' },
      studentToken,
    );

    const deleteResponse = await createDeleteRequestWithAuth(
      `/ai/attempts/${attemptId}/chat/history`,
      studentToken,
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toHaveProperty('message');

    const history = await createGetRequestWithAuth(
      `/ai/attempts/${attemptId}/chat/history`,
      studentToken,
    );

    expect(history.status).toBe(200);
    expect(history.body).toHaveLength(0);
  });
});
