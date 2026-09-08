import { createGetRequest, prisma } from '../../../helpers/testHelper';

describe('GET /topics/exam/:examId', () => {
  let seededExamId: string;

  beforeAll(async () => {
    const exam = await prisma.exam.findFirst({
      where: { slug: 'exame-funcional' },
    });
    if (!exam) {
      throw new Error('Seed funcional nao preparou exame');
    }
    seededExamId = exam.id;
  });

  it('deve retornar a lista de topicos pertencentes ao exame', async () => {
    const response = await createGetRequest(`/topics/exam/${seededExamId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const containsSeeded = response.body.some(
      (topic: { slug: string }) => topic.slug === 'topico-funcional',
    );
    expect(containsSeeded).toBe(true);
  });
});