import { FindExamByIdOrSlugUseCase } from '../../find-exam-by-id-or-slug.use-case';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindExamByIdOrSlugUseCase', () => {
  let repository: InMemoryExamRepository;
  let sut: FindExamByIdOrSlugUseCase;

  beforeEach(() => {
    repository = new InMemoryExamRepository();
    sut = new FindExamByIdOrSlugUseCase(repository);
  });

  it('should return an exam when searching by id', async () => {
    const exam = Exam.create({
      name: 'Cloud',
      slug: Slug.create('cloud'),
      description: 'Cloud exam',
    });

    await repository.create(exam);

    const result = await sut.execute(exam.id);

    expect(result.id).toBe(exam.id);
    expect(result.slug.value).toBe('cloud');
  });

  it('should return an exam when searching by slug', async () => {
    const exam = Exam.create({
      name: 'AWS',
      slug: Slug.create('aws'),
      description: 'AWS exam',
    });

    await repository.create(exam);

    const result = await sut.execute('aws');

    expect(result.id).toBe(exam.id);
    expect(result.name).toBe('AWS');
  });

  it('should throw ResourceNotFoundError when exam does not exist', async () => {
    await expect(sut.execute('missing-exam')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
