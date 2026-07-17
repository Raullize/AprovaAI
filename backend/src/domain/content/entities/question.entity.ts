import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface OptionProps {
  id?: string;
  text: string;
  isCorrect?: boolean;
  order: number;
}

export interface QuestionProps {
  content: string;
  imageUrl?: string | null;
  type?: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  status?: 'PUBLISHED' | 'DRAFT';
  order: number;
  explanation?: string | null;
  studyLink?: string | null;
  simulationId: string;
  options?: OptionProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Question extends AggregateRoot<QuestionProps> {
  get content(): string {
    return this.props.content;
  }
  get imageUrl(): string | null | undefined {
    return this.props.imageUrl;
  }
  get type(): 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' {
    return this.props.type ?? 'MULTIPLE_CHOICE';
  }
  get status(): 'PUBLISHED' | 'DRAFT' {
    return this.props.status ?? 'PUBLISHED';
  }
  get order(): number {
    return this.props.order;
  }
  get explanation(): string | null | undefined {
    return this.props.explanation;
  }
  get studyLink(): string | null | undefined {
    return this.props.studyLink;
  }
  get simulationId(): string {
    return this.props.simulationId;
  }
  get options(): OptionProps[] {
    return this.props.options ?? [];
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static create(props: QuestionProps, id?: string): Question {
    return new Question(
      {
        ...props,
        type: props.type ?? 'MULTIPLE_CHOICE',
        status: props.status ?? 'PUBLISHED',
        options: props.options ?? [],
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
    content: string;
    imageUrl: string | null | undefined;
    type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
    explanation: string | null | undefined;
    studyLink: string | null | undefined;
    simulationId: string;
  }): void {
    this.props.content = details.content;
    this.props.imageUrl = details.imageUrl;
    this.props.type = details.type;
    this.props.explanation = details.explanation;
    this.props.studyLink = details.studyLink;
    this.props.simulationId = details.simulationId;
    this.props.updatedAt = new Date();
  }

  public updateOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }

  public updateOptions(options: OptionProps[]): void {
    if (options.length === 0) {
      throw new ValidationError('A question must have at least one option.');
    }
    this.props.options = options;
    this.props.updatedAt = new Date();
  }
}
