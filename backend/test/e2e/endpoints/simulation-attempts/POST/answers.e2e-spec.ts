import {
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('POST /simulation-attempts/:id/answers', () => {
  let studentToken: string;
  let simulationId: string;
  let questionId: string;
  let correctOptionId: string;
  let incorrectOptionId: string;
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
    if (!simulation) {
      throw new Error('Seed funcional nao preparou simulado');
    }
    simulationId = simulation.id;

    const question = await prisma.question.findFirst({
      where: { simulationId: simulation.id },
    });
    if (!question) {
      throw new Error('Seed funcional nao preparou questao');
    }
    questionId = question.id;

    const correctOption = await prisma.option.findFirst({
      where: { questionId: question.id, isCorrect: true },
    });
    if (!correctOption) {
      throw new Error('Seed funcional nao preparou alternativa correta');
    }
    correctOptionId = correctOption.id;

    const incorrectOption = await prisma.option.findFirst({
      where: { questionId: question.id, isCorrect: false },
    });
    if (!incorrectOption) {
      throw new Error('Seed funcional nao preparou alternativa incorreta');
    }
    incorrectOptionId = incorrectOption.id;
  });

  beforeEach(async () => {
    const response = await createPostRequestWithAuth(
      '/simulation-attempts/start',
      { simulationId },
      studentToken,
    );
    simulationAttemptId = response.body.id;
  });

  it('deve registrar a resposta correta de uma questao no simulado', async () => {
    const response = await createPostRequestWithAuth(
      `/simulation-attempts/${simulationAttemptId}/answers`,
      {
        questionId,
        selectedOptions: [correctOptionId],
        timeSpent: 10,
        isFlaggedForReview: false,
      },
      studentToken,
    );

    expect(response.status).toBe(201);
    expect(response.body.isCorrect).toBe(true);
    expect(response.body.questionId).toBe(questionId);
  });

  it('deve registrar a resposta incorreta de uma questao no simulado', async () => {
    const response = await createPostRequestWithAuth(
      `/simulation-attempts/${simulationAttemptId}/answers`,
      {
        questionId,
        selectedOptions: [incorrectOptionId],
        timeSpent: 15,
        isFlaggedForReview: true,
      },
      studentToken,
    );

    expect(response.status).toBe(201);
    expect(response.body.isCorrect).toBe(false);
    expect(response.body.isFlaggedForReview).toBe(true);
  });

  it('deve retornar 400 se tentar responder com corpo de dados incompleto', async () => {
    const response = await createPostRequestWithAuth(
      `/simulation-attempts/${simulationAttemptId}/answers`,
      { questionId },
      studentToken,
    );

    expect(response.status).toBe(400);
  });
});
