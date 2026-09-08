import { Simulation } from '../../src/domain/content/entities/simulation.entity';
import { SimulationRepository } from '../../src/domain/content/repositories/simulation.repository';
import { DomainEvents } from '../../src/shared/core/events/domain-events';

export class InMemorySimulationRepository implements SimulationRepository {
  public items: Simulation[] = [];

  findAll(): Promise<Simulation[]> {
    return Promise.resolve(this.items);
  }

  findByTopicId(topicId: string): Promise<Simulation[]> {
    const simulations = this.items.filter((item) => item.topicId === topicId);
    return Promise.resolve(simulations.sort((a, b) => a.order - b.order));
  }

  findById(id: string): Promise<Simulation | null> {
    const simulation = this.items.find((item) => item.id === id);
    return Promise.resolve(simulation || null);
  }

  findBySlug(slug: string): Promise<Simulation | null> {
    const simulation = this.items.find((item) => item.slug.value === slug);
    return Promise.resolve(simulation || null);
  }

  findBySlugAndTopicId(
    slug: string,
    topicId: string,
  ): Promise<Simulation | null> {
    const simulation = this.items.find(
      (item) => item.slug.value === slug && item.topicId === topicId,
    );
    return Promise.resolve(simulation || null);
  }

  create(simulation: Simulation): Promise<Simulation> {
    this.items.push(simulation);
    DomainEvents.dispatchEventsForAggregate(simulation.id);
    return Promise.resolve(simulation);
  }

  save(simulation: Simulation): Promise<Simulation> {
    const itemIndex = this.items.findIndex((item) => item.id === simulation.id);

    if (itemIndex >= 0) {
      this.items[itemIndex] = simulation;
      DomainEvents.dispatchEventsForAggregate(simulation.id);
    }

    return Promise.resolve(simulation);
  }

  delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === id);

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }

    return Promise.resolve();
  }

  reorder(orderedIds: string[]): Promise<void> {
    orderedIds.forEach((id, index) => {
      const simulation = this.items.find((item) => item.id === id);
      if (simulation) {
        simulation.updateOrder(index);
      }
    });
    return Promise.resolve();
  }

  countByTopicId(topicId: string): Promise<number> {
    const count = this.items.filter((item) => item.topicId === topicId).length;
    return Promise.resolve(count);
  }
}
