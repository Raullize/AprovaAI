import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  createGetRequest,
  prisma,
} from '../../../helpers/testHelper';

describe('PATCH /topics/reorder', () => {
  let adminToken: string;
  let examId: string;
  const createdIds: string[] = [];

  beforeAll(async () => {
    const adminLogin = await createPostRequest('/auth/login', {
      email: 'admin.functional@aprovaai.test',
      password: 'Admin@123',
    });
    adminToken = adminLogin.body.token;

    const exam = await prisma.exam.findFirst({
      where: { slug: 'exame-funcional' },
    });
    if (!exam) throw new Error('Seed funcional nao preparou exame');
    examId = exam.id;

    for (let i = 0; i < 2; i += 1) {
      const res = await createPostRequestWithAuth(
        '/topics',
        {
          name: `Topico Reorder Smoke ${i}`,
          description: 'Criado por smoke test reorder',
          status: 'PUBLISHED',
          order: 10 + i,
          examId,
        },
        adminToken,
      );
      createdIds.push(res.body.id);
    }
  });

  afterAll(async () => {
    await prisma.topic.deleteMany({ where: { id: { in: createdIds } } });
  });

  it('reordena todos os topicos de um exame com admin', async () => {
    const before = await createGetRequest(`/topics/exam/${examId}`);
    expect(before.status).toBe(200);
    const ids = before.body.map((topic: { id: string }) => topic.id);
    expect(ids.length).toBeGreaterThan(0);

    const reversed = [...ids].reverse();
    const response = await createPatchRequestWithAuth(
      '/topics/reorder',
      { ids: reversed },
      adminToken,
    );

    expect(response.status).toBe(200);

    const after = await createGetRequest(`/topics/exam/${examId}`);
    const afterIds = after.body.map((topic: { id: string }) => topic.id);
    expect(afterIds).toEqual(reversed);
  });
});