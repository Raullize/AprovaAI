import {
  createPostRequest,
  createPatchRequestWithAuth,
} from '../../../helpers/testHelper';

describe('PATCH /account/profile', () => {
  let tempUserToken: string;
  const uniqueSuffix = Date.now();
  const tempEmail = `account.temp.patch.${uniqueSuffix}.functional@aprovaai.test`;
  const tempUsername = `u_pat_${uniqueSuffix}`;

  beforeAll(async () => {
    await createPostRequest('/auth/register', {
      fullName: 'Usuario Patch Temporario',
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

  it('deve atualizar o perfil usando PATCH', async () => {
    const response = await createPatchRequestWithAuth(
      '/account/profile',
      {
        fullName: 'Nome Atualizado Funcional',
        username: `${tempUsername}_new`,
      },
      tempUserToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('string');
    expect(response.body.fullName).toBe('Nome Atualizado Funcional');
    expect(response.body.username).toBe(`${tempUsername}_new`);
    expect(response.body.email).toBe(tempEmail);
    expect(response.body.role).toBe('STUDENT');
    expect(typeof response.body.xp).toBe('number');
    expect(typeof response.body.streakCount).toBe('number');
    expect(typeof response.body.bestStreak).toBe('number');
  });
});
