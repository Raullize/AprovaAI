import {
  createGetRequestWithAuth,
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('POST /simulations/generate', () => {
  let adminToken: string;
  let studentToken: string;
  let topicId: string;
  const createdSimulationIds: string[] = [];

  beforeAll(async () => {
    const adminLogin = await createPostRequest('/auth/login', {
      email: 'admin.functional@aprovaai.test',
      password: 'Admin@123',
    });
    adminToken = adminLogin.body.token;

    const studentLogin = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = studentLogin.body.token;

    const topic = await prisma.topic.findFirst({
      where: { slug: 'topico-funcional' },
    });
    if (!topic) {
      throw new Error('Seed funcional nao preparou o topico');
    }
    topicId = topic.id;
  });

  afterAll(async () => {
    if (createdSimulationIds.length === 0) return;

    await prisma.simulation.deleteMany({
      where: { id: { in: createdSimulationIds } },
    });
  });

  it('deve retornar 401 sem autenticacao', async () => {
    const response = await createPostRequest('/simulations/generate', {
      topicId,
      source: 'AI',
      count: 2,
    });

    expect(response.status).toBe(401);
  });

  it('deve retornar 403 para aluno', async () => {
    const response = await createPostRequestWithAuth(
      '/simulations/generate',
      { topicId, source: 'AI', count: 2 },
      studentToken,
    );

    expect(response.status).toBe(403);
  });

  it('deve retornar 400 quando faltam filtros do ENEM', async () => {
    const response = await createPostRequestWithAuth(
      '/simulations/generate',
      { topicId, source: 'ENEM', count: 2 },
      adminToken,
    );

    expect(response.status).toBe(400);
  });

  it('deve gerar um simulado rascunho com questoes do ENEM', async () => {
    const response = await createPostRequestWithAuth(
      '/simulations/generate',
      {
        topicId,
        source: 'ENEM',
        count: 3,
        discipline: 'matematica',
        years: [2023],
      },
      adminToken,
    );

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('DRAFT');
    expect(response.body.source).toBe('ENEM');
    expect(response.body.questionsCount).toBe(3);
    createdSimulationIds.push(response.body.id);

    const questions = await createGetRequestWithAuth(
      `/questions/simulation/${response.body.id}`,
      adminToken,
    );

    expect(questions.status).toBe(200);
    expect(questions.body).toHaveLength(3);
    expect(
      questions.body.every(
        (question: { status: string; source: string }) =>
          question.status === 'DRAFT' && question.source === 'ENEM',
      ),
    ).toBe(true);
    expect(
      questions.body.every(
        (question: {
          options: { isCorrect: boolean }[];
          explanation?: string;
        }) =>
          question.options.filter((option) => option.isCorrect).length === 1 &&
          !!question.explanation,
      ),
    ).toBe(true);

    const studentTopicSimulations = await createGetRequestWithAuth(
      `/simulations/topic/${topicId}`,
      studentToken,
    );

    expect(studentTopicSimulations.status).toBe(200);
    expect(
      studentTopicSimulations.body.some(
        (simulation: { id: string }) => simulation.id === response.body.id,
      ),
    ).toBe(false);
  });

  it('deve gerar um simulado rascunho com questoes de IA', async () => {
    const response = await createPostRequestWithAuth(
      '/simulations/generate',
      {
        topicId,
        source: 'AI',
        count: 2,
        focus: 'fundamentos da computação em nuvem',
      },
      adminToken,
    );

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('DRAFT');
    expect(response.body.source).toBe('AI');
    expect(response.body.questionsCount).toBe(2);
    createdSimulationIds.push(response.body.id);

    const questions = await createGetRequestWithAuth(
      `/questions/simulation/${response.body.id}`,
      adminToken,
    );

    expect(questions.status).toBe(200);
    expect(questions.body).toHaveLength(2);
    expect(
      questions.body.every(
        (question: { source: string; aiModel?: string }) =>
          question.source === 'AI' && !!question.aiModel,
      ),
    ).toBe(true);
  });
});
