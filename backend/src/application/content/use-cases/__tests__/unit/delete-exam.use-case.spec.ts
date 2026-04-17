import { DeleteExamUseCase } from '../../delete-exam.use-case';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('DeleteExamUseCase', () => {
  let useCase: DeleteExamUseCase;
  let repository: InMemoryExamRepository;

  beforeEach(() => {
    repository = new InMemoryExamRepository();
    useCase = new DeleteExamUseCase(repository);
  });

  it('should be able to delete an exam', async () => {
    const exam = Exam.create({
      name: 'Exam to Delete',
      slug: Slug.create('exam-to-delete'),
    });
    await repository.create(exam);

    expect(repository.items).toHaveLength(1);

    await useCase.execute(exam.id);

    expect(repository.items).toHaveLength(0);
  });

  it('should not throw when deleting a non-existing exam', async () => {
    await expect(useCase.execute('non-existing-id')).resolves.not.toThrow();
  });

  it('should only delete the target exam, leaving others intact', async () => {
    const examA = Exam.create({
      name: 'Exam A',
      slug: Slug.create('exam-a'),
    });
    const examB = Exam.create({
      name: 'Exam B',
      slug: Slug.create('exam-b'),
    });
    await repository.create(examA);
    await repository.create(examB);

    await useCase.execute(examA.id);

    expect(repository.items).toHaveLength(1);
    expect(repository.items[0].id).toBe(examB.id);
  });
});
