import { createGetRequest } from '../../../helpers/testHelper';

describe('GET /simulations', () => {
  it('retorna lista publica de simulados', async () => {
    const response = await createGetRequest('/simulations');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
