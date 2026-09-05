import {
  createPostRequest,
  createGetRequestWithAuth,
} from '../../helpers/testHelper';

describe('GET /account/profile', () => {
  let tempUserToken: string;
  const uniqueSuffix = Date.now();
  const tempEmail = `account.temp.get.${uniqueSuffix}.functional@aprovaai.test`;
  const tempUsername = `u_get_${uniqueSuffix}`;

  beforeAll(async () => {
    await createPostRequest('/auth/register', {
      fullName: 'Usuario Get Temporario',
      username: tempUsername,
      email: tempEmail,
      password: 'Password@123',
      dateOfBirth: '1995-05-15',
    });

    const loginResponse = await createPostRequest('/auth/login', {
      email: tempEmail,
      password: 'Password@123',
    });
    tempUserToken = loginResponse.body.token;
  });

  it('deve retornar os detalhes do perfil do usuario logado', async () => {
    const response = await createGetRequestWithAuth(
      '/account/profile',
      tempUserToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).not.toBeNull();
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('string');
    expect(response.body.fullName).toBe('Usuario Get Temporario');
    expect(response.body.username).toBe(tempUsername);
    expect(response.body.email).toBe(tempEmail);
    expect(response.body.role).toBe('STUDENT');
    expect(response.body).toHaveProperty('subscriptionPlan');
    expect(typeof response.body.subscriptionPlan).toBe('string');
    expect(typeof response.body.xp).toBe('number');
    expect(typeof response.body.streakCount).toBe('number');
    expect(typeof response.body.bestStreak).toBe('number');
  });
});
