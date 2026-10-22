import {
  createGetRequestWithAuth,
  createPostRequest,
  createPostRequestWithAuth,
} from '../../../helpers/testHelper';

describe('POST /ai/chat', () => {
  let studentToken: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;
  });

  it('deve retornar 401 ao conversar sem autenticação', async () => {
    const response = await createPostRequest('/ai/chat', { message: 'Olá' });

    expect(response.status).toBe(401);
  });

  it('deve retornar 400 para mensagem vazia', async () => {
    const response = await createPostRequestWithAuth(
      '/ai/chat',
      { message: '   ' },
      studentToken,
    );

    expect(response.status).toBe(400);
  });

  it('deve responder e persistir a conversa no histórico', async () => {
    const question = 'Como funciona o XP?';

    const response = await createPostRequestWithAuth(
      '/ai/chat',
      { message: question },
      studentToken,
    );

    expect(response.status).toBe(201);
    expect(typeof response.body.reply).toBe('string');
    expect(response.body.reply.length).toBeGreaterThan(0);

    const history = await createGetRequestWithAuth(
      '/ai/chat/history',
      studentToken,
    );

    expect(history.status).toBe(200);
    expect(Array.isArray(history.body)).toBe(true);

    const contents = history.body.map(
      (item: { content: string }) => item.content,
    );
    expect(contents).toContain(question);
    expect(contents).toContain(response.body.reply);
    expect(history.body[0]).toHaveProperty('role');
    expect(history.body[0]).toHaveProperty('createdAt');
  });
});
