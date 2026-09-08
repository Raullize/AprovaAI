import {
  createPostRequest,
  createPostRequestWithAuth,
  createPatchRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('POST /topics', () => {
  let studentToken: string;
  let adminToken: string;
  let examId: string;
  let createdTopicId: string;

  beforeAll(async () => {
    const studentLogin = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = studentLogin.body.token;

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
  });

  afterAll(async () => {
    if (createdTopicId) {
      await prisma.topic.deleteMany({ where: { id: createdTopicId } });
    }
  });

  it('403 para STUDENT', async () => {
    const res = await createPostRequestWithAuth(
      '/topics',
      { name: 'Proibido', slug: 'proibido-topic', examId },
      studentToken,
    );
    expect(res.status).toBe(403);
  });

  it('201 para ADMIN cria topico', async () => {
    const createRes = await createPostRequestWithAuth(
      '/topics',
      {
        name: 'Topico Smoke',
        slug: 'topico-smoke-post',
        examId,
        order: 10,
        status: 'PUBLISHED',
      },
      adminToken,
    );
    expect(createRes.status).toBe(201);
    expect(createRes.body.slug).toBe('topico-smoke');
    createdTopicId = createRes.body.id;
  });
});
