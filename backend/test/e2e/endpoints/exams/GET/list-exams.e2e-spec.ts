import { createGetRequest, prisma } from '../../../helpers/testHelper';

describe('GET /exams', () => {
  let seededExamId: string;

  beforeAll(async () => {
    const exam = await prisma.exam.findFirst({
      where: { slug: 'exame-funcional' },
    });
    if (!exam) {
      throw new Error('Seed funcional nao preparou exame com slug exame-funcional');
    }
    seededExamId = exam.id;
  });

  it('deve retornar a lista de todos os exames cadastrados', async () => {
    const response = await createGetRequest('/exams');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const containsSeeded = response.body.some(
      (ex: { id: string }) => ex.id === seededExamId,
    );
    expect(containsSeeded).toBe(true);
  });
});
