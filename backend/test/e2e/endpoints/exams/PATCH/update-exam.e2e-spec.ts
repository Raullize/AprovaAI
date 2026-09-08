import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('PATCH /exams/:id', () => {
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
        name: 'Exame Patch Smoke',
        description: 'Criado por smoke test patch',
        status: 'PUBLISHED',
        category: 'OUTROS',
      },
      adminToken,
    );
    createdExamId = createRes.body.id;
  });

  afterAll(async () => {
    if (createdExamId) {
      await prisma.exam.deleteMany({ where: { id: createdExamId } });
    }
  });

  it('atualiza exame com admin', async () => {
    const response = await createPatchRequestWithAuth(
      `/exams/${createdExamId}`,
      { name: 'Exame Patch Atualizado', description: 'Descricao nova' },
      adminToken,
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdExamId);
    expect(response.body.name).toBe('Exame Patch Atualizado');
  });

  it('retorna 403 para estudante (role STUDENT)', async () => {
    const studentLogin = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    const response = await createPatchRequestWithAuth(
      `/exams/${createdExamId}`,
      { name: 'Nao pode' },
      studentLogin.body.token,
    );

    expect(response.status).toBe(403);
  });
});
