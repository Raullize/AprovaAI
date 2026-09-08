import {
  createPostRequest,
  createPostRequestWithAuth,
  createDeleteRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('DELETE /exams/:id', () => {
  let adminToken: string;
  let createdExamId: string;

  beforeAll(async () => {
    const adminLogin = await createPostRequest('/auth/login', {
      email: 'admin.functional@aprovaai.test',
      password: 'Admin@123',
    });
    adminToken = adminLogin.body.token;

    const createRes = await createPostRequestWithAuth(
      '/exams',
      {
        name: 'Exame Delete Smoke',
        description: 'Criado por smoke test delete',
        status: 'PUBLISHED',
        category: 'OUTROS',
      },
      adminToken,
    );
    createdExamId = createRes.body.id;
  });

  it('deleta exame com admin', async () => {
    const deletedId = createdExamId;
    const response = await createDeleteRequestWithAuth(
      `/exams/${deletedId}`,
      adminToken,
    );

    expect(response.status).toBe(200);
    createdExamId = '';

    const stillExists = await prisma.exam.findUnique({
      where: { id: deletedId },
    });
    expect(stillExists).toBeNull();
  });

  it('retorna 403 para estudante (role STUDENT)', async () => {
    const studentLogin = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    const response = await createDeleteRequestWithAuth(
      `/exams/${createdExamId || '00000000-0000-0000-0000-000000000000'}`,
      studentLogin.body.token,
    );

    expect(response.status).toBe(403);
  });
});
