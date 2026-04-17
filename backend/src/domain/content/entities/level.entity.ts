import { Entity } from '../../../shared/core/entity';
import { Slug } from '../value-objects/slug';

export interface LevelProps {
  name: string;
  slug: Slug;
  description?: string | null;
  order: number;
  topicId: string;
  status?: 'ACTIVE' | 'INACTIVE';
  xpReward?: number;
  passingPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Level extends Entity<LevelProps> {
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
    return this.props.passingPercentage ?? 70.0;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static create(props: LevelProps, id?: string): Level {
    return new Level(
      {
        ...props,
        status: props.status ?? 'ACTIVE',
        xpReward: props.xpReward ?? 0,
        passingPercentage: props.passingPercentage ?? 70.0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public activate(): void {
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.status = 'INACTIVE';
    this.props.updatedAt = new Date();
  }

  public updateDetails(
    name: string,
    description: string | null | undefined,
    slug: Slug,
    topicId: string,
    xpReward: number,
    passingPercentage: number,
  ): void {
    if (passingPercentage < 0 || passingPercentage > 100) {
      throw new Error('Passing percentage must be between 0 and 100.');
    }
    this.props.name = name;
    this.props.description = description;
    this.props.slug = slug;
    this.props.topicId = topicId;
    this.props.xpReward = xpReward;
    this.props.passingPercentage = passingPercentage;
    this.props.updatedAt = new Date();
  }

  public updateOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }
}
