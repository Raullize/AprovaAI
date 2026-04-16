import { Entity } from '../../../shared/core/entity';

export interface TopicProps {
  name: string;
  slug: string;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  order?: number;
  examId: string;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    levels?: number;
  };
}

export class Topic extends Entity<TopicProps> {
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get description() {
    return this.props.description;
  }
  get status() {
    return this.props.status ?? 'ACTIVE';
  }
  get order() {
    return this.props.order ?? 0;
  }
  get examId() {
    return this.props.examId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: TopicProps, id?: string): Topic {
    return new Topic(
      {
        ...props,
        status: props.status ?? 'ACTIVE',
        order: props.order ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }
}
