import {
  createPostRequest,
  createGetRequestWithAuth,
  createGetRequest,
} from '../../helpers/testHelper';

describe('GET /student/dashboard-stats', () => {
  let studentToken: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;
  });

  it('deve retornar estatisticas do painel sem informar o mes', async () => {
    const response = await createGetRequestWithAuth(
      '/student/dashboard-stats',
      studentToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('streakCount');
    expect(response.body).toHaveProperty('activeDays');
    expect(Array.isArray(response.body.activeDays)).toBe(true);
  });

  it('deve retornar estatisticas do painel informando um mes especifico', async () => {
    const response = await createGetRequestWithAuth(
      '/student/dashboard-stats?month=2026-05',
      studentToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('streakCount');
    expect(response.body).toHaveProperty('activeDays');
  });

  it('deve retornar 401 ao tentar obter estatisticas sem autenticacao', async () => {
    const response = await createGetRequest('/student/dashboard-stats');

    expect(response.status).toBe(401);
  });
});
