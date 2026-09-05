import { createGetRequest } from '../../../helpers/testHelper';

describe('GET /questions', () => {
  it('retorna lista publica', async () => {
    const res = await createGetRequest('/questions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
