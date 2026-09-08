import { createGetRequest, prisma } from '../../../helpers/testHelper';

describe('GET /simulations/topic/:topicId', () => {
  let seededTopicId: string;

  beforeAll(async () => {
    const topic = await prisma.topic.findFirst({
      where: { slug: 'topico-funcional' },
    });
    if (!topic) {
      throw new Error('Seed funcional nao preparou topico');
    }
    seededTopicId = topic.id;
  });

  it('deve retornar a lista de simulados pertencentes ao topico', async () => {
    const response = await createGetRequest(
      `/simulations/topic/${seededTopicId}`,
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const containsSeeded = response.body.some(
      (simulation: { slug: string }) => simulation.slug === 'simulado-funcional',
    );
    expect(containsSeeded).toBe(true);
  });
});