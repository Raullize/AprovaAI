import {
  createPostRequest,
  createPostRequestWithAuth,
  createDeleteRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('DELETE /topics/:id', () => {
  let adminToken: string;
  let examId: string;
  let createdTopicId: string;

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

    const createRes = await createPostRequestWithAuth(
      '/topics',
      {
        name: 'Topico Delete Smoke',
        slug: 'topico-delete-smoke',
        examId,
        order: 12,
        status: 'PUBLISHED',
      },
      adminToken,
    );
    createdTopicId = createRes.body.id;
  });

  it('apaga topico com admin', async () => {
    const deleteRes = await createDeleteRequestWithAuth(
      `/topics/${createdTopicId}`,
      adminToken,
    );
    expect(deleteRes.status).toBe(200);
    createdTopicId = '';
  });
});
