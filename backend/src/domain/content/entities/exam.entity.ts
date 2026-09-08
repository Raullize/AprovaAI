import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Slug } from '../value-objects/slug';

export interface ExamProps {
  name: string;
  slug: Slug;
  description?: string | null;
  status?: 'PUBLISHED' | 'DRAFT';
  order?: number;
  topicsCount?: number;
  iconKey?: string | null;
  colorScheme?: string | null;
  category?: string | null;
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
  get status(): 'PUBLISHED' | 'DRAFT' {
    return this.props.status ?? 'PUBLISHED';
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
  get topicsCount(): number {
    return this.props.topicsCount ?? 0;
  }
  get iconKey(): string | null | undefined {
    return this.props.iconKey;
  }
  get colorScheme(): string | null | undefined {
    return this.props.colorScheme;
  }
  get category(): string | null | undefined {
    return this.props.category;
  }

  static create(props: ExamProps, id?: string): Exam {
    return new Exam(
      {
        ...props,
        status: props.status ?? 'PUBLISHED',
        order: props.order ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
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
    iconKey?: string | null;
    colorScheme?: string | null;
    category?: string | null;
  }): void {
    this.props.name = details.name;
    this.props.description = details.description;
    this.props.slug = details.slug;
    if (details.iconKey !== undefined) this.props.iconKey = details.iconKey;
    if (details.colorScheme !== undefined)
      this.props.colorScheme = details.colorScheme;
    if (details.category !== undefined) this.props.category = details.category;
    this.props.updatedAt = new Date();
  }

  public updateOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }
}
