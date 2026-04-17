import { CreateExamUseCase } from '../../create-exam.use-case';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';

describe('CreateExamUseCase', () => {
  let useCase: CreateExamUseCase;
  let repository: InMemoryExamRepository;

  beforeEach(() => {
    repository = new InMemoryExamRepository();
    useCase = new CreateExamUseCase(repository);
  });

  it('should be able to create a new exam', async () => {
    const request = {
      name: 'Matemática Básica',
      description: 'Exame de matemática para iniciantes',
    };

    const exam = await useCase.execute(request);

    expect(exam.id).toBeDefined();
    expect(exam.name).toBe('Matemática Básica');
    expect(exam.description).toBe('Exame de matemática para iniciantes');
    expect(exam.slug.value).toContain('matematica-basica');
    expect(exam.status).toBe('ACTIVE');

    expect(repository.items).toHaveLength(1);
    expect(repository.items[0].id).toBe(exam.id);
  });

  it('should be able to create an exam with INACTIVE status', async () => {
    const request = {
      name: 'Física',
      status: 'INACTIVE' as const,
    };

    const exam = await useCase.execute(request);

    expect(exam.status).toBe('INACTIVE');
  });

  it('should generate unique slugs for exams with the same name', async () => {
    const request1 = { name: 'Exame Teste' };
    const request2 = { name: 'Exame Teste' };

    const exam1 = await useCase.execute(request1);
    const exam2 = await useCase.execute(request2);

    expect(exam1.slug.value).toBe('exame-teste');
    expect(exam2.slug.value).toBe('exame-teste-1');
  });
});
