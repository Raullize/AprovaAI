import {
  createPostRequest,
  createPostRequestWithAuth,
  createGetRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('GET /simulations/:idOrSlug', () => {
  let adminToken: string;
  let topicId: string;
  let createdSimulationId: string;

  beforeAll(async () => {
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

    const createRes = await createPostRequestWithAuth(
      '/simulations',
      {
        name: 'Simulado Get Detail Smoke',
        slug: 'simulado-get-detail-smoke',
        description: 'Criado por smoke test e2e detail',
        order: 20,
        xpReward: 50,
        passingPercentage: 60,
        simulationMode: 'PRACTICE',
        status: 'PUBLISHED',
        topicId,
      },
      adminToken,
    );
    createdSimulationId = createRes.body.id;
  });

  afterAll(async () => {
    if (createdSimulationId) {
      await prisma.simulation.deleteMany({
        where: { id: createdSimulationId },
      });
    }
  });

  it('retorna detalhes do simulado por ID', async () => {
    const response = await createGetRequestWithAuth(
      `/simulations/${createdSimulationId}`,
      adminToken,
    );
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdSimulationId);
  });
});
