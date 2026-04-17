import { DomainEvent } from '../../../shared/core/events/domain-event';
import { Level } from '../entities/level.entity';

export class LevelCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public level: Level;

  constructor(level: Level) {
    this.level = level;
    this.ocurredAt = new Date();
  }

  getAggregateId(): string {
    return this.level.id;
  }
}
