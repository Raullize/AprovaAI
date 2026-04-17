import { FindExamByIdUseCase } from '../../find-exam-by-id.use-case';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindExamByIdUseCase', () => {
  let useCase: FindExamByIdUseCase;
  let repository: InMemoryExamRepository;

  beforeEach(() => {
    repository = new InMemoryExamRepository();
    useCase = new FindExamByIdUseCase(repository);
  });

  it('should return an exam when it exists', async () => {
    const exam = Exam.create({
      name: 'My Exam',
      slug: Slug.create('my-exam'),
      description: 'A test exam',
    });
    await repository.create(exam);

    const found = await useCase.execute(exam.id);

    expect(found.id).toBe(exam.id);
    expect(found.name).toBe('My Exam');
    expect(found.description).toBe('A test exam');
    expect(found.slug.value).toBe('my-exam');
  });

  it('should throw ResourceNotFoundError when exam does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should throw ResourceNotFoundError with the correct identifier in the message', async () => {
    await expect(useCase.execute('bad-id')).rejects.toThrow(
      "Exam with identifier 'bad-id' not found",
    );
  });
});
