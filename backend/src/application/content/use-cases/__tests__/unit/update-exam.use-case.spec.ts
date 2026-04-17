import { UpdateExamUseCase } from '../../update-exam.use-case';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('UpdateExamUseCase', () => {
  let useCase: UpdateExamUseCase;
  let repository: InMemoryExamRepository;

  beforeEach(() => {
    repository = new InMemoryExamRepository();
    useCase = new UpdateExamUseCase(repository);
  });

  it('should be able to update an existing exam details', async () => {
    const exam = Exam.create({
      name: 'Original Name',
      slug: Slug.create('original-name'),
      description: 'Original Description',
      status: 'INACTIVE',
    });
    await repository.create(exam);

    const updatedExam = await useCase.execute({
      id: exam.id,
      data: {
        name: 'New Name',
        description: 'New Description',
        status: 'ACTIVE',
      },
    });

    expect(updatedExam.name).toBe('New Name');
    expect(updatedExam.slug.value).toBe('new-name');
    expect(updatedExam.description).toBe('New Description');
    expect(updatedExam.status).toBe('ACTIVE');
    expect(updatedExam.updatedAt).toBeDefined();

    const savedExam = await repository.findById(exam.id);
    expect(savedExam?.name).toBe('New Name');
    expect(savedExam?.status).toBe('ACTIVE');
  });

  it('should throw an error if the exam does not exist', async () => {
    await expect(
      useCase.execute({
        id: 'non-existing-id',
        data: { name: 'Teste' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should only update the provided fields (partial update)', async () => {
    const exam = Exam.create({
      name: 'Original Name',
      slug: Slug.create('original-name'),
      description: 'Original Description',
    });
    await repository.create(exam);

    const updatedExam = await useCase.execute({
      id: exam.id,
      data: {
        description: 'Updated Description',
      },
    });

    expect(updatedExam.name).toBe('Original Name');
    expect(updatedExam.slug.value).toBe('original-name');
    expect(updatedExam.description).toBe('Updated Description');
  });
});
