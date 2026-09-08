import {
  createPostRequest,
  createDeleteRequestWithAuth,
  createGetRequestWithAuth,
} from '../../../helpers/testHelper';

describe('DELETE /account', () => {
  let tempUserToken: string;
  const uniqueSuffix = Date.now();
  const tempEmail = `account.temp.delete.${uniqueSuffix}.functional@aprovaai.test`;
  const tempUsername = `u_del_${uniqueSuffix}`;

  beforeAll(async () => {
    await createPostRequest('/auth/register', {
      fullName: 'Usuario Delete Temporario',
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

  it('deve excluir a conta com sucesso usando DELETE', async () => {
    const response = await createDeleteRequestWithAuth(
      '/account',
      tempUserToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(typeof response.body.message).toBe('string');
    expect(response.body.message).toBe('Conta excluída com sucesso.');

    const profileResponse = await createGetRequestWithAuth(
      '/account/profile',
      tempUserToken,
    );

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body).toEqual({});
  });
});
