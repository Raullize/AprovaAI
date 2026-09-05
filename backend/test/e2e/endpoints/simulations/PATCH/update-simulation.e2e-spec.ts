import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('PATCH /simulations/:id', () => {
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
        name: 'Simulado Patch Smoke',
        slug: 'simulado-patch-smoke',
        description: 'Criado por smoke test patch',
        order: 15,
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

  it('atualiza simulado com admin', async () => {
    const response = await createPatchRequestWithAuth(
      `/simulations/${createdSimulationId}`,
      { name: 'Simulado Smoke Atualizado' },
      adminToken,
    );

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Simulado Smoke Atualizado');
  });
});
