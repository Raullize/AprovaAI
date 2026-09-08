import {
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('POST /exams', () => {
  let studentToken: string;
  let adminToken: string;

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
  });

  it('deve permitir que o administrador crie um novo exame', async () => {
    const response = await createPostRequestWithAuth(
      '/exams',
      {
        name: 'Exame Adicional Funcional',
        slug: 'exame-adicional-funcional',
        description: 'Descricao adicional',
        status: 'PUBLISHED',
        category: 'OUTROS',
        order: 2,
      },
      adminToken,
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.slug).toBe('exame-adicional-funcional');

    await prisma.exam.delete({ where: { id: response.body.id } });
  });

  it('deve recusar a criacao de exame por um usuario nao-administrador', async () => {
    const response = await createPostRequestWithAuth(
      '/exams',
      {
        name: 'Exame Proibido',
        slug: 'exame-proibido',
        category: 'OUTROS',
      },
      studentToken,
    );

    expect(response.status).toBe(403);
  });
});
