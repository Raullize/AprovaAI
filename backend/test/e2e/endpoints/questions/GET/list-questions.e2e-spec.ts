import {
  createPostRequest,
  createGetRequestWithAuth,
} from '../../../helpers/testHelper';

describe('GET /questions', () => {
  let studentToken: string;

  beforeAll(async () => {
    const loginResponse = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = loginResponse.body.token;
  });

  it('retorna lista de questoes para usuario autenticado', async () => {
    const res = await createGetRequestWithAuth('/questions', studentToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
