import { Entity } from '../../../shared/core/entity';

export interface ExamProps {
  name: string;
  slug: string;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    topics?: number;
  };
}

export class Exam extends Entity<ExamProps> {
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
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: ExamProps, id?: string): Exam {
    return new Exam(
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
