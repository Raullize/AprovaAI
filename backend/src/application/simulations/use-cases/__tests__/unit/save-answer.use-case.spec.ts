import { SaveAnswerUseCase } from '../../save-answer.use-case';
import { InMemorySimulationAttemptRepository } from '../../../../../../test/repositories/in-memory-simulation-attempt.repository';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { SimulationAttempt } from '../../../../../domain/simulations/entities/simulation-attempt.entity';
import { Question } from '../../../../../domain/content/entities/question.entity';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../../../shared/core/errors/validation.error';

describe('SaveAnswerUseCase', () => {
  let simulationAttemptRepository: InMemorySimulationAttemptRepository;
  let questionRepository: InMemoryQuestionRepository;
  let sut: SaveAnswerUseCase;

  beforeEach(() => {
    simulationAttemptRepository = new InMemorySimulationAttemptRepository();
    questionRepository = new InMemoryQuestionRepository();
    sut = new SaveAnswerUseCase(
      simulationAttemptRepository,
      questionRepository,
    );
  });

  it('should save a correct single choice answer in practice mode', async () => {
    const simulationAttempt = SimulationAttempt.create({
      userId: 'user-1',
      simulationId: 'simulation-1',
      status: 'IN_PROGRESS',
      mode: 'PRACTICE',
      totalQuestions: 1,
      answers: [],
    });

    const question = Question.create({
      content: 'Qual e a capital do Brasil?',
      simulationId: 'simulation-1',
      order: 0,
      type: 'SINGLE_CHOICE',
      options: [
        { id: 'a', text: 'Rio de Janeiro', isCorrect: false, order: 0 },
        { id: 'b', text: 'Brasilia', isCorrect: true, order: 1 },
      ],
    });

    await simulationAttemptRepository.create(simulationAttempt);
    await questionRepository.create(question);

    const result = await sut.execute({
      userId: 'user-1',
      simulationAttemptId: simulationAttempt.id,
      questionId: question.id,
      selectedOptions: ['b'],
      timeSpent: 12,
    });

    expect(result.isCorrect).toBe(true);
    expect(simulationAttemptRepository.answers).toHaveLength(1);
  });

  it('should hide correctness in exam mode', async () => {
    const simulationAttempt = SimulationAttempt.create({
      userId: 'user-1',
      simulationId: 'simulation-1',
      status: 'IN_PROGRESS',
      mode: 'EXAM',
      totalQuestions: 1,
      answers: [],
    });

    const question = Question.create({
      content: 'Selecione as corretas',
      simulationId: 'simulation-1',
      order: 0,
      type: 'MULTIPLE_CHOICE',
      options: [
        { id: 'a', text: 'Opcao A', isCorrect: true, order: 0 },
        { id: 'b', text: 'Opcao B', isCorrect: true, order: 1 },
        { id: 'c', text: 'Opcao C', isCorrect: false, order: 2 },
      ],
    });

    await simulationAttemptRepository.create(simulationAttempt);
    await questionRepository.create(question);

    const result = await sut.execute({
      userId: 'user-1',
      simulationAttemptId: simulationAttempt.id,
      questionId: question.id,
      selectedOptions: ['a', 'b'],
    });

    expect(result.isCorrect).toBeNull();
    expect(simulationAttemptRepository.answers[0].isCorrect).toBe(true);
  });

  it('should throw ValidationError when question belongs to another simulation', async () => {
    const simulationAttempt = SimulationAttempt.create({
      userId: 'user-1',
      simulationId: 'simulation-1',
      status: 'IN_PROGRESS',
      mode: 'PRACTICE',
      totalQuestions: 1,
      answers: [],
    });

    const question = Question.create({
      content: 'Pergunta',
      simulationId: 'simulation-2',
      order: 0,
      options: [{ id: 'a', text: 'Opcao', isCorrect: true, order: 0 }],
    });

    await simulationAttemptRepository.create(simulationAttempt);
    await questionRepository.create(question);

    await expect(
      sut.execute({
        userId: 'user-1',
        simulationAttemptId: simulationAttempt.id,
        questionId: question.id,
        selectedOptions: ['a'],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should throw ResourceNotFoundError when question does not exist', async () => {
    const simulationAttempt = SimulationAttempt.create({
      userId: 'user-1',
      simulationId: 'simulation-1',
      status: 'IN_PROGRESS',
      mode: 'PRACTICE',
      totalQuestions: 1,
      answers: [],
    });

    await simulationAttemptRepository.create(simulationAttempt);

    await expect(
      sut.execute({
        userId: 'user-1',
        simulationAttemptId: simulationAttempt.id,
        questionId: 'missing-question',
        selectedOptions: ['a'],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
