import {
  createPostRequest,
  createGetRequestWithAuth,
} from '../../../helpers/testHelper';

describe('GET /student/leaderboard', () => {
  let studentToken: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;
  });

  it('deve retornar o ranking global de XP dos estudantes', async () => {
    const response = await createGetRequestWithAuth(
      '/student/leaderboard',
      studentToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('topUsers');
    expect(Array.isArray(response.body.topUsers)).toBe(true);
    expect(response.body).toHaveProperty('currentUserEntry');
    expect(response.body).toHaveProperty('currentUserRank');
  });
});
