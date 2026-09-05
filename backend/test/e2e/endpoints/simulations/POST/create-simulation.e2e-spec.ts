import {
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('POST /simulations', () => {
  let studentToken: string;
  let adminToken: string;
  let topicId: string;
  let createdSimulationId: string;

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

    const topic = await prisma.topic.findFirst({
      where: { slug: 'topico-funcional' },
    });
    if (!topic) throw new Error('Seed funcional nao preparou topico');
    topicId = topic.id;
  });

  afterAll(async () => {
    if (createdSimulationId) {
      await prisma.simulation.deleteMany({
        where: { id: createdSimulationId },
      });
    }
  });

  it('retorna 401 sem token', async () => {
    const response = await createPostRequest('/simulations', {
      name: 'Tentativa sem token',
      slug: 'tentativa-sem-token',
      topicId,
    });
    expect(response.status).toBe(401);
  });

  it('retorna 403 para estudante (role STUDENT)', async () => {
    const response = await createPostRequestWithAuth(
      '/simulations',
      {
        name: 'Simulado Proibido',
        slug: 'simulado-proibido',
        topicId,
      },
      studentToken,
    );
    expect(response.status).toBe(403);
  });

  it('cria simulado com admin (201)', async () => {
    const response = await createPostRequestWithAuth(
      '/simulations',
      {
        name: 'Simulado Smoke Test',
        slug: 'simulado-smoke-test-post',
        description: 'Criado por smoke test e2e',
        order: 10,
        xpReward: 50,
        passingPercentage: 60,
        simulationMode: 'PRACTICE',
        status: 'PUBLISHED',
        topicId,
      },
      adminToken,
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.slug).toBe('simulado-smoke-test-post');
    createdSimulationId = response.body.id;
  });
});
