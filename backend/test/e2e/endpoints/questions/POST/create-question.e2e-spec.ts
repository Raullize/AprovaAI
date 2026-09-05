import {
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('POST /questions', () => {
  let studentToken: string;
  let adminToken: string;
  let simulationId: string;
  let createdQuestionId: string;

  beforeAll(async () => {
    const studentLogin = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = studentLogin.body.token;

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
  });

  afterAll(async () => {
    if (createdQuestionId) {
      await prisma.question.deleteMany({ where: { id: createdQuestionId } });
    }
  });

  it('403 para STUDENT', async () => {
    const res = await createPostRequestWithAuth(
      '/questions',
      {
        content: 'Questao proibida',
        simulationId,
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
      },
      studentToken,
    );
    expect(res.status).toBe(403);
  });

  it('201 para ADMIN cria questao', async () => {
    const createRes = await createPostRequestWithAuth(
      '/questions',
      {
        content: 'Questao smoke test create',
        type: 'SINGLE_CHOICE',
        simulationId,
        explanation: 'Explicacao smoke',
        options: [
          { text: 'Alternativa Certa', isCorrect: true },
          { text: 'Alternativa Errada', isCorrect: false },
        ],
      },
      adminToken,
    );
    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('id');
    createdQuestionId = createRes.body.id;
  });

  it('400 sem options (payload invalido)', async () => {
    const invalidRes = await createPostRequestWithAuth(
      '/questions',
      {
        content: 'Questao invalida sem opcoes',
        simulationId,
      },
      adminToken,
    );
    expect(invalidRes.status).toBe(400);
  });
});
