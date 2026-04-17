import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Slug } from '../value-objects/slug';

export interface ExamProps {
  name: string;
  slug: Slug;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Exam extends AggregateRoot<ExamProps> {
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
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
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
  }): void {
    this.props.name = details.name;
    this.props.description = details.description;
    this.props.slug = details.slug;
    this.props.updatedAt = new Date();
  }

  public updateOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }
}
