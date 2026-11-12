import { ContentGenerationRepository } from '../../src/domain/content/repositories/content-generation.repository';
import { Question } from '../../src/domain/content/entities/question.entity';
import { Simulation } from '../../src/domain/content/entities/simulation.entity';
import { InMemoryQuestionRepository } from './in-memory-question.repository';
import { InMemorySimulationRepository } from './in-memory-simulation.repository';

export class InMemoryContentGenerationRepository implements ContentGenerationRepository {
  constructor(
    private readonly simulationRepository: InMemorySimulationRepository,
    private readonly questionRepository: InMemoryQuestionRepository,
  ) {}

  async createSimulationWithQuestions(
    simulation: Simulation,
    questions: Question[],
  ): Promise<Simulation> {
    await this.simulationRepository.create(simulation);

    for (const question of questions) {
      await this.questionRepository.create(question);
    }

    return simulation;
  }
}
