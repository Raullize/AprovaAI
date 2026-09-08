import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('PATCH /questions/:id', () => {
  let adminToken: string;
  let simulationId: string;
  let createdQuestionId: string;

  beforeAll(async () => {
    const adminLogin = await createPostRequest('/auth/login', {
      email: 'admin.functional@aprovaai.test',
      password: 'Admin@123',
    });
    adminToken = adminLogin.body.token;

    const simulation = await prisma.simulation.findFirst({
      where: { slug: 'simulado-funcional' },
    });
    if (!simulation) throw new Error('Seed funcional nao preparou simulado');
    simulationId = simulation.id;

    const createRes = await createPostRequestWithAuth(
      '/questions',
      {
        content: 'Questao patch smoke',
        type: 'SINGLE_CHOICE',
        simulationId,
        explanation: 'Explicacao patch smoke',
        options: [
          { text: 'Alternativa Certa', isCorrect: true },
          { text: 'Alternativa Errada', isCorrect: false },
        ],
      },
      adminToken,
    );
    createdQuestionId = createRes.body.id;
  });

  afterAll(async () => {
    if (createdQuestionId) {
      await prisma.question.deleteMany({ where: { id: createdQuestionId } });
    }
  });

  it('atualiza questao com admin', async () => {
    const response = await createPatchRequestWithAuth(
      `/questions/${createdQuestionId}`,
      { content: 'Questao patch atualizada' },
      adminToken,
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdQuestionId);
    expect(response.body.content).toBe('Questao patch atualizada');
  });

  it('retorna 403 para estudante (role STUDENT)', async () => {
    const studentLogin = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    const response = await createPatchRequestWithAuth(
      `/questions/${createdQuestionId}`,
      { content: 'Nao pode' },
      studentLogin.body.token,
    );

    expect(response.status).toBe(403);
  });
});
