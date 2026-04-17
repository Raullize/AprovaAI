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
  _count?: {
    questions?: number;
  };
}

export class Level extends Entity<LevelProps> {
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get description() {
    return this.props.description;
  }
  get order() {
    return this.props.order;
  }
  get topicId() {
    return this.props.topicId;
  }
  get status() {
    return this.props.status ?? 'ACTIVE';
  }
  get xpReward() {
    return this.props.xpReward ?? 0;
  }
  get passingPercentage() {
    return this.props.passingPercentage ?? 70.0;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
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
}
