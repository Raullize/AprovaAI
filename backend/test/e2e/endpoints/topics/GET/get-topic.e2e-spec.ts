import { createGetRequest, prisma } from '../../../helpers/testHelper';

describe('GET /topics/:idOrSlug', () => {
  let seededTopicId: string;
  let seededTopicSlug: string;

  beforeAll(async () => {
    const topic = await prisma.topic.findFirst({
      where: { slug: 'topico-funcional' },
    });
    if (!topic) {
      throw new Error('Seed funcional nao preparou topico');
    }
    seededTopicId = topic.id;
    seededTopicSlug = topic.slug;
  });

  it('deve buscar os detalhes de um topico por ID', async () => {
    const response = await createGetRequest(`/topics/${seededTopicId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(seededTopicId);
    expect(response.body.name).toBe('Topico Funcional');
  });

  it('deve buscar os detalhes de um topico por Slug', async () => {
    const response = await createGetRequest(`/topics/${seededTopicSlug}`);

    expect(response.status).toBe(200);
    expect(response.body.slug).toBe(seededTopicSlug);
  });

  it('deve retornar 404 para ID ou Slug nao cadastrados', async () => {
    const response = await createGetRequest('/topics/slug-inexistente-456');

    expect(response.status).toBe(404);
  });
});