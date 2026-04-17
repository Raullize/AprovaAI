import { FindAllExamsUseCase } from '../../find-all-exams.use-case';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('FindAllExamsUseCase', () => {
  let useCase: FindAllExamsUseCase;
  let repository: InMemoryExamRepository;

  beforeEach(() => {
    repository = new InMemoryExamRepository();
    useCase = new FindAllExamsUseCase(repository);
  });

  it('should return all exams from the repository', async () => {
    const examA = Exam.create({ name: 'Exam A', slug: Slug.create('exam-a') });
    const examB = Exam.create({ name: 'Exam B', slug: Slug.create('exam-b') });

    await repository.create(examA);
    await repository.create(examB);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toContain(examA.id);
    expect(result.map((e) => e.id)).toContain(examB.id);
  });

  it('should return exams sorted by order', async () => {
    const examB = Exam.create({
      name: 'Exam B',
      slug: Slug.create('exam-b'),
      order: 1,
    });
    const examA = Exam.create({
      name: 'Exam A',
      slug: Slug.create('exam-a'),
      order: 0,
    });

    // Insert in "wrong" order
    await repository.create(examB);
    await repository.create(examA);

    const result = await useCase.execute();

    expect(result[0].id).toBe(examA.id);
    expect(result[1].id).toBe(examB.id);
  });

  it('should return an empty array when there are no exams', async () => {
    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
