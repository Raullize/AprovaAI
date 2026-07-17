import { DomainEvent } from '../../../shared/core/events/domain-event';
import { Simulation } from '../entities/simulation.entity';

export class SimulationCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public simulation: Simulation;

  constructor(simulation: Simulation) {
    this.simulation = simulation;
    this.ocurredAt = new Date();
  }

  getAggregateId(): string {
    return this.simulation.id;
  }
}
