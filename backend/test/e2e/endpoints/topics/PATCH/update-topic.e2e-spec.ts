import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('PATCH /topics/:id', () => {
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
        name: 'Topico Patch Smoke',
        slug: 'topico-patch-smoke',
        examId,
        order: 11,
        status: 'PUBLISHED',
      },
      adminToken,
    );
    createdTopicId = createRes.body.id;
  });

  afterAll(async () => {
    if (createdTopicId) {
      await prisma.topic.deleteMany({ where: { id: createdTopicId } });
    }
  });

  it('atualiza topico com admin', async () => {
    const patchRes = await createPatchRequestWithAuth(
      `/topics/${createdTopicId}`,
      { description: 'Topico atualizado por smoke' },
      adminToken,
    );
    expect(patchRes.status).toBe(200);
  });
});
