import { createGetRequest } from '../../../helpers/testHelper';

describe('GET /topics', () => {
  it('retorna lista publica', async () => {
    const res = await createGetRequest('/topics');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
