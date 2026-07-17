import { Simulation } from '../entities/simulation.entity';

export abstract class SimulationRepository {
  abstract findAll(): Promise<Simulation[]>;
  abstract findByTopicId(topicId: string): Promise<Simulation[]>;
  abstract findById(id: string): Promise<Simulation | null>;
  abstract findBySlug(slug: string): Promise<Simulation | null>;
  abstract findBySlugAndTopicId(
    slug: string,
    topicId: string,
  ): Promise<Simulation | null>;
  abstract create(simulation: Simulation): Promise<Simulation>;
  abstract save(simulation: Simulation): Promise<Simulation>;
  abstract delete(id: string): Promise<void>;
  abstract reorder(orderedIds: string[]): Promise<void>;
  abstract countByTopicId(topicId: string): Promise<number>;
}
