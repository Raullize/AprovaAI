import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  createGetRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('PATCH /questions/reorder', () => {
  let adminToken: string;
  let simulationId: string;
  const createdIds: string[] = [];

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

    for (let i = 0; i < 2; i += 1) {
      const res = await createPostRequestWithAuth(
        '/questions',
        {
          content: `Questao reorder smoke ${i}`,
          type: 'SINGLE_CHOICE',
          simulationId,
          explanation: 'Explicacao reorder smoke',
          options: [
            { text: 'Alternativa Certa', isCorrect: true },
            { text: 'Alternativa Errada', isCorrect: false },
          ],
        },
        adminToken,
      );
      createdIds.push(res.body.id);
    }
  });

  afterAll(async () => {
    await prisma.question.deleteMany({ where: { id: { in: createdIds } } });
  });

  it('reordena todas as questoes de um simulado com admin', async () => {
    const before = await createGetRequestWithAuth(
      `/questions/simulation/${simulationId}`,
      adminToken,
    );
    expect(before.status).toBe(200);
    const ids = before.body.map((question: { id: string }) => question.id);
    expect(ids.length).toBeGreaterThan(0);

    const reversed = [...ids].reverse();
    const response = await createPatchRequestWithAuth(
      '/questions/reorder',
      { ids: reversed },
      adminToken,
    );

    expect(response.status).toBe(200);

    const after = await createGetRequestWithAuth(
      `/questions/simulation/${simulationId}`,
      adminToken,
    );
    const afterIds = after.body.map((question: { id: string }) => question.id);
    expect(afterIds).toEqual(reversed);
  });
});