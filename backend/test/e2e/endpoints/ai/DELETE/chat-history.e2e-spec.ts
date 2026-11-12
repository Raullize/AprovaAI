import {
  createDeleteRequestWithAuth,
  createGetRequestWithAuth,
  createPostRequest,
  createPostRequestWithAuth,
} from '../../../helpers/testHelper';

describe('DELETE /ai/chat/history', () => {
  let studentToken: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;
  });

  it('deve retornar 401 sem autenticacao', async () => {
    const response = await createDeleteRequestWithAuth('/ai/chat/history', '');

    expect(response.status).toBe(401);
  });

  it('deve apagar o historico global do aluno', async () => {
    const message = 'Mensagem que sera apagada do chat global.';
    await createPostRequestWithAuth('/ai/chat', { message }, studentToken);

    const deleteResponse = await createDeleteRequestWithAuth(
      '/ai/chat/history',
      studentToken,
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toHaveProperty('message');

    const history = await createGetRequestWithAuth(
      '/ai/chat/history',
      studentToken,
    );

    expect(history.status).toBe(200);
    const contents = history.body.map(
      (item: { content: string }) => item.content,
    );
    expect(contents).not.toContain(message);
  });
});
