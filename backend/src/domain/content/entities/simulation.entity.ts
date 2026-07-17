import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Slug } from '../value-objects/slug';
import { Percentage } from '../value-objects/percentage';
import { SimulationCreatedEvent } from '../events/simulation-created.event';

export type SimulationStatus = 'PUBLISHED' | 'DRAFT';

export interface SimulationProps {
  name: string;
  slug: Slug;
  description?: string | null;
  order: number;
  topicId: string;
  status?: SimulationStatus;
  xpReward?: number;
  passingPercentage?: Percentage;
  timeLimit?: number | null;
  simulationMode?: 'PRACTICE' | 'EXAM';
  questionsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Simulation extends AggregateRoot<SimulationProps> {
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
  get status(): 'PUBLISHED' | 'DRAFT' {
    return this.props.status ?? 'PUBLISHED';
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

  get timeLimit(): number | null | undefined {
    return this.props.timeLimit;
  }

  get simulationMode(): 'PRACTICE' | 'EXAM' {
    return this.props.simulationMode ?? 'PRACTICE';
  }

  get questionsCount(): number {
    return this.props.questionsCount ?? 0;
  }

  static create(props: SimulationProps, id?: string): Simulation {
    const simulation = new Simulation(
      {
        ...props,
        status: props.status ?? 'PUBLISHED',
        xpReward: props.xpReward ?? 0,
        passingPercentage: props.passingPercentage ?? Percentage.create(70.0),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    const isNewSimulation = !id;
    if (isNewSimulation) {
      simulation.addDomainEvent(new SimulationCreatedEvent(simulation));
    }

    return simulation;
  }

  public activate(): void {
    this.props.status = 'PUBLISHED';
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.status = 'DRAFT';
    this.props.updatedAt = new Date();
  }

  public updateDetails(details: {
    name: string;
    description: string | null | undefined;
    slug: Slug;
    topicId: string;
    xpReward: number;
    passingPercentage: Percentage;
    timeLimit?: number | null;
    simulationMode?: 'PRACTICE' | 'EXAM';
  }): void {
    this.props.name = details.name;
    this.props.description = details.description;
    this.props.slug = details.slug;
    this.props.topicId = details.topicId;
    this.props.xpReward = details.xpReward;
    this.props.passingPercentage = details.passingPercentage;
    if (details.timeLimit !== undefined) this.props.timeLimit = details.timeLimit;
    if (details.simulationMode !== undefined) this.props.simulationMode = details.simulationMode;
    this.props.updatedAt = new Date();
  }

  public updateOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }
}
