import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Slug } from '../value-objects/slug';

export interface TopicProps {
  name: string;
  slug: Slug;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  examId: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Topic extends AggregateRoot<TopicProps> {
  get name(): string {
    return this.props.name;
  }
  get slug(): Slug {
    return this.props.slug;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get status(): 'ACTIVE' | 'INACTIVE' {
    return this.props.status ?? 'ACTIVE';
  }
  get order(): number {
    return this.props.order ?? 0;
  }
  get examId(): string {
    return this.props.examId;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
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
    examId: string,
  ): void {
    this.props.name = name;
    this.props.description = description;
    this.props.slug = slug;
    this.props.examId = examId;
    this.props.updatedAt = new Date();
  }

  public updateOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }
}
