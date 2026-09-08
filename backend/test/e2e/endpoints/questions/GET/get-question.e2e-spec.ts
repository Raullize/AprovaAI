import {
  createPostRequest,
  createGetRequestWithAuth,
  createGetRequest,
  prisma,
} from '../../../helpers/testHelper';

describe('GET /questions/:id', () => {
  let studentToken: string;
  let seededQuestionId: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;

    const simulation = await prisma.simulation.findFirst({
      where: { slug: 'simulado-funcional' },
    });
    if (!simulation) throw new Error('Seed funcional nao preparou simulado');

    const question = await prisma.question.findFirst({
      where: { simulationId: simulation.id },
    });
    if (!question) throw new Error('Seed funcional nao preparou questao');
    seededQuestionId = question.id;
  });

  it('deve buscar os detalhes de uma questao por ID autenticado', async () => {
    const response = await createGetRequestWithAuth(
      `/questions/${seededQuestionId}`,
      studentToken,
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(seededQuestionId);
    expect(response.body.content).toContain('teste funcional');
  });

  it('deve retornar 401 sem autenticacao', async () => {
    const response = await createGetRequest(`/questions/${seededQuestionId}`);

    expect(response.status).toBe(401);
  });
});
