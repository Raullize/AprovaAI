import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  createGetRequest,
  prisma,
} from '../../../helpers/testHelper';

describe('PATCH /simulations/reorder', () => {
  let adminToken: string;
  let topicId: string;
  const createdIds: string[] = [];

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

    for (let i = 0; i < 2; i += 1) {
      const res = await createPostRequestWithAuth(
        '/simulations',
        {
          name: `Simulado Reorder Smoke ${i}`,
          description: 'Criado por smoke test reorder',
          order: 10 + i,
          xpReward: 50,
          passingPercentage: 60,
          simulationMode: 'PRACTICE',
          status: 'PUBLISHED',
          topicId,
        },
        adminToken,
      );
      createdIds.push(res.body.id);
    }
  });

  afterAll(async () => {
    await prisma.simulation.deleteMany({ where: { id: { in: createdIds } } });
  });

  it('reordena todos os simulados de um topico com admin', async () => {
    const before = await createGetRequest(`/simulations/topic/${topicId}`);
    expect(before.status).toBe(200);
    const ids = before.body.map((simulation: { id: string }) => simulation.id);
    expect(ids.length).toBeGreaterThan(0);

    const reversed = [...ids].reverse();
    const response = await createPatchRequestWithAuth(
      '/simulations/reorder',
      { ids: reversed },
      adminToken,
    );

    expect(response.status).toBe(200);

    const after = await createGetRequest(`/simulations/topic/${topicId}`);
    const afterIds = after.body.map(
      (simulation: { id: string }) => simulation.id,
    );
    expect(afterIds).toEqual(reversed);
  });
});