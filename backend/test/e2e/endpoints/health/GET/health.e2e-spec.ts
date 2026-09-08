import { createGetRequest } from '../../../helpers/testHelper';

describe('GET /health', () => {
  it('deve retornar o status ok do healthcheck', async () => {
    const response = await createGetRequest('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.info).toHaveProperty('prisma');
  });
});
