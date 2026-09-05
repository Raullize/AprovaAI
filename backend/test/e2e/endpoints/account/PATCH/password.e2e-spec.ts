import {
  createPostRequest,
  createPatchRequestWithAuth,
} from '../../../helpers/testHelper';

describe('PATCH /account/password', () => {
  let tempUserToken: string;
  const uniqueSuffix = Date.now();
  const tempEmail = `account.temp.pwd.${uniqueSuffix}.functional@aprovaai.test`;
  const tempUsername = `u_pwd_${uniqueSuffix}`;
  const currentPassword = 'Password@123';
  const newPassword = 'NewPassword@456';

  beforeAll(async () => {
    await createPostRequest('/auth/register', {
      fullName: 'Usuario Password Temporario',
      username: tempUsername,
      email: tempEmail,
      password: currentPassword,
      dateOfBirth: '1995-05-15',
    });

    const loginResponse = await createPostRequest('/auth/login', {
      email: tempEmail,
      password: currentPassword,
    });
    tempUserToken = loginResponse.body.token;
  });

  it('deve atualizar a senha com sucesso', async () => {
    const response = await createPatchRequestWithAuth(
      '/account/password',
      {
        currentPassword,
        newPassword,
      },
      tempUserToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(typeof response.body.message).toBe('string');
    expect(response.body.message).toBe('Senha atualizada com sucesso.');
  });

  it('deve retornar 400 se senha atual estiver errada', async () => {
    const response = await createPatchRequestWithAuth(
      '/account/password',
      {
        currentPassword: 'SenhaErrada@123',
        newPassword: 'OutraSenha@789',
      },
      tempUserToken,
    );

    expect(response.status).toBe(400);
  });
});
