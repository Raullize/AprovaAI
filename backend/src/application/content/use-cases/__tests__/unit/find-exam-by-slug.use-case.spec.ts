import { FindExamBySlugUseCase } from '../../find-exam-by-slug.use-case';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindExamBySlugUseCase', () => {
  let useCase: FindExamBySlugUseCase;
  let repository: InMemoryExamRepository;

  beforeEach(() => {
    repository = new InMemoryExamRepository();
    useCase = new FindExamBySlugUseCase(repository);
  });

  it('should return an exam when slug is found', async () => {
    const exam = Exam.create({
      name: 'My Exam',
      slug: Slug.create('my-exam'),
      description: 'A test exam',
    });
    await repository.create(exam);

    const found = await useCase.execute('my-exam');

    expect(found.id).toBe(exam.id);
    expect(found.name).toBe('My Exam');
    expect(found.slug.value).toBe('my-exam');
  });

  it('should throw ResourceNotFoundError when slug does not match any exam', async () => {
    await expect(useCase.execute('non-existing-slug')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should return the correct exam when multiple exist', async () => {
    const examA = Exam.create({ name: 'Exam A', slug: Slug.create('exam-a') });
    const examB = Exam.create({ name: 'Exam B', slug: Slug.create('exam-b') });

    await repository.create(examA);
    await repository.create(examB);

    const found = await useCase.execute('exam-b');

    expect(found.id).toBe(examB.id);
    expect(found.name).toBe('Exam B');
  });
});
