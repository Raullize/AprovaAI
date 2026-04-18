import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Slug } from '../value-objects/slug';
import { Percentage } from '../value-objects/percentage';
import { LevelCreatedEvent } from '../events/level-created.event';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface LevelProps {
  name: string;
  slug: Slug;
  description?: string | null;
  order: number;
  topicId: string;
  status?: 'ACTIVE' | 'INACTIVE';
  xpReward?: number;
  passingPercentage?: Percentage;
  questionsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Level extends AggregateRoot<LevelProps> {
  get name(): string {
    return this.props.name;
  }
  get slug(): Slug {
    return this.props.slug;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get order(): number {
    return this.props.order;
  }
  get topicId(): string {
    return this.props.topicId;
  }
  get status(): 'ACTIVE' | 'INACTIVE' {
    return this.props.status ?? 'ACTIVE';
  }
  get xpReward(): number {
    return this.props.xpReward ?? 0;
  }
  get passingPercentage(): number {
    return this.props.passingPercentage?.value ?? 70.0;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
  get questionsCount(): number {
    return this.props.questionsCount ?? 0;
  }

  static create(props: LevelProps, id?: string): Level {
    const level = new Level(
      {
        ...props,
        status: props.status ?? 'ACTIVE',
        xpReward: props.xpReward ?? 0,
        passingPercentage: props.passingPercentage ?? Percentage.create(70.0),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    const isNewLevel = !id;
    if (isNewLevel) {
      level.addDomainEvent(new LevelCreatedEvent(level));
    }

    return level;
  }

  public activate(): void {
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.status = 'INACTIVE';
    this.props.updatedAt = new Date();
  }

  public updateDetails(details: {
    name: string;
    description: string | null | undefined;
    slug: Slug;
    topicId: string;
    xpReward: number;
    passingPercentage: Percentage;
  }): void {
    this.props.name = details.name;
    this.props.description = details.description;
    this.props.slug = details.slug;
    this.props.topicId = details.topicId;
    this.props.xpReward = details.xpReward;
    this.props.passingPercentage = details.passingPercentage;
    this.props.updatedAt = new Date();
  }

  public updateOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }
}
