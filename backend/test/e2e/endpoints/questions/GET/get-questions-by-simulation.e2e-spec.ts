import {
  createPostRequest,
  createGetRequestWithAuth,
  createGetRequest,
  prisma,
} from '../../../helpers/testHelper';

describe('GET /questions/simulation/:simulationId', () => {
  let studentToken: string;
  let seededSimulationId: string;

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
    seededSimulationId = simulation.id;
  });

  it('deve retornar a lista de questoes do simulado para usuario autenticado', async () => {
    const response = await createGetRequestWithAuth(
      `/questions/simulation/${seededSimulationId}`,
      studentToken,
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const containsSeeded = response.body.some((question: { content: string }) =>
      question.content.includes('teste funcional'),
    );
    expect(containsSeeded).toBe(true);
  });

  it('deve retornar 401 sem autenticacao', async () => {
    const response = await createGetRequest(
      `/questions/simulation/${seededSimulationId}`,
    );

    expect(response.status).toBe(401);
  });
});
