import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  createGetRequest,
  prisma,
} from '../../../helpers/testHelper';

describe('PATCH /exams/reorder', () => {
  let adminToken: string;
  const createdIds: string[] = [];

  beforeAll(async () => {
    const adminLogin = await createPostRequest('/auth/login', {
      email: 'admin.functional@aprovaai.test',
      password: 'Admin@123',
    });
    adminToken = adminLogin.body.token;

    for (let i = 0; i < 2; i += 1) {
      const res = await createPostRequestWithAuth(
        '/exams',
        {
          name: `Exame Reorder Smoke ${i}`,
          description: 'Criado por smoke test reorder',
          status: 'PUBLISHED',
          category: 'OUTROS',
        },
        adminToken,
      );
      createdIds.push(res.body.id);
    }
  });

  afterAll(async () => {
    await prisma.exam.deleteMany({ where: { id: { in: createdIds } } });
  });

  it('reordena todos os exames com admin', async () => {
    const before = await createGetRequest('/exams');
    expect(before.status).toBe(200);
    const ids = before.body.map((exam: { id: string }) => exam.id);
    expect(ids.length).toBeGreaterThan(0);

    const reversed = [...ids].reverse();
    const response = await createPatchRequestWithAuth(
      '/exams/reorder',
      { ids: reversed },
      adminToken,
    );

    expect(response.status).toBe(200);

    const after = await createGetRequest('/exams');
    const afterIds = after.body.map((exam: { id: string }) => exam.id);
    expect(afterIds).toEqual(reversed);
  });

  it('retorna 403 para estudante (role STUDENT)', async () => {
    const studentLogin = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    const response = await createPatchRequestWithAuth(
      '/exams/reorder',
      { ids: ['00000000-0000-0000-0000-000000000000'] },
      studentLogin.body.token,
    );

    expect(response.status).toBe(403);
  });
});
