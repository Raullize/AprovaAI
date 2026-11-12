import { Simulation } from '../entities/simulation.entity';
import { Question } from '../entities/question.entity';

export abstract class ContentGenerationRepository {
  abstract createSimulationWithQuestions(
    simulation: Simulation,
    questions: Question[],
  ): Promise<Simulation>;
}
