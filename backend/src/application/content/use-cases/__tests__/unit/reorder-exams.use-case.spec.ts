import { ReorderExamsUseCase } from '../../reorder-exams.use-case';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('ReorderExamsUseCase', () => {
  let useCase: ReorderExamsUseCase;
  let repository: InMemoryExamRepository;

  beforeEach(() => {
    repository = new InMemoryExamRepository();
    useCase = new ReorderExamsUseCase(repository);
  });

  it('should reorder exams according to the given ids array', async () => {
    const examA = Exam.create({
      name: 'Exam A',
      slug: Slug.create('exam-a'),
      order: 0,
    });
    const examB = Exam.create({
      name: 'Exam B',
      slug: Slug.create('exam-b'),
      order: 1,
    });
    const examC = Exam.create({
      name: 'Exam C',
      slug: Slug.create('exam-c'),
      order: 2,
    });

    await repository.create(examA);
    await repository.create(examB);
    await repository.create(examC);

    // Reverse: C, A, B
    await useCase.execute({ ids: [examC.id, examA.id, examB.id] });

    const all = await repository.findAll();

    expect(all[0].id).toBe(examC.id);
    expect(all[1].id).toBe(examA.id);
    expect(all[2].id).toBe(examB.id);
  });

  it('should assign correct numeric order values (0-indexed)', async () => {
    const examA = Exam.create({
      name: 'Exam A',
      slug: Slug.create('exam-a'),
      order: 0,
    });
    const examB = Exam.create({
      name: 'Exam B',
      slug: Slug.create('exam-b'),
      order: 1,
    });

    await repository.create(examA);
    await repository.create(examB);

    await useCase.execute({ ids: [examB.id, examA.id] });

    const examBAfter = repository.items.find((e) => e.id === examB.id)!;
    const examAAfter = repository.items.find((e) => e.id === examA.id)!;

    expect(examBAfter.order).toBe(0);
    expect(examAAfter.order).toBe(1);
  });
});
