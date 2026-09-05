import {
  createPostRequest,
  createPostRequestWithAuth,
  prisma,
} from '../../helpers/testHelper';

describe('POST /simulation-attempts/start', () => {
  let studentToken: string;
  let simulationId: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;

    const simulation = await prisma.simulation.findFirst({
      where: { slug: 'simulado-funcional' },
    });
    if (!simulation) {
      throw new Error(
        'Seed funcional nao preparou simulation com slug simulado-funcional',
      );
    }
    simulationId = simulation.id;
  });

  it('deve iniciar um simulado com sucesso para um simulationId valido', async () => {
    const response = await createPostRequestWithAuth(
      '/simulation-attempts/start',
      { simulationId },
      studentToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.simulationId).toBe(simulationId);
    expect(response.body.status).toBe('IN_PROGRESS');
  });

  it('deve retornar 404 ao tentar iniciar um simulado com simulationId inexistente', async () => {
    const nonExistentSimulationId =
      '00000000-0000-0000-0000-000000000000';
    const response = await createPostRequestWithAuth(
      '/simulation-attempts/start',
      { simulationId: nonExistentSimulationId },
      studentToken,
    );

    expect(response.status).toBe(404);
  });

  it('deve retornar 401 ao tentar iniciar sem estar autenticado', async () => {
    const response = await createPostRequest(
      '/simulation-attempts/start',
      { simulationId },
    );

    expect(response.status).toBe(401);
  });
});
