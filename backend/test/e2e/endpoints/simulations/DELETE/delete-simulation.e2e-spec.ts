import {
  createPostRequest,
  createPostRequestWithAuth,
  createDeleteRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('DELETE /simulations/:id', () => {
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
        name: 'Simulado Delete Smoke',
        slug: 'simulado-delete-smoke',
        description: 'Criado por smoke test delete',
        order: 25,
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

  it('deleta simulado com admin', async () => {
    const response = await createDeleteRequestWithAuth(
      `/simulations/${createdSimulationId}`,
      adminToken,
    );
    expect(response.status).toBe(200);
    createdSimulationId = '';
  });
});
