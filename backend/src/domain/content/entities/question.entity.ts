import { AggregateRoot } from '../../../shared/core/aggregate-root';

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
  status?: 'ACTIVE' | 'INACTIVE';
  order: number;
  explanation?: string | null;
  studyLink?: string | null;
  levelId: string;
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
  get status(): 'ACTIVE' | 'INACTIVE' {
    return this.props.status ?? 'ACTIVE';
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
  get levelId(): string {
    return this.props.levelId;
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
        status: props.status ?? 'ACTIVE',
        options: props.options ?? [],
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
    content: string,
    imageUrl: string | null | undefined,
    type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE',
    explanation: string | null | undefined,
    studyLink: string | null | undefined,
    levelId: string,
  ): void {
    this.props.content = content;
    this.props.imageUrl = imageUrl;
    this.props.type = type;
    this.props.explanation = explanation;
    this.props.studyLink = studyLink;
    this.props.levelId = levelId;
    this.props.updatedAt = new Date();
  }

  public updateOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }

  public updateOptions(options: OptionProps[]): void {
    if (options.length === 0) {
      throw new Error('A question must have at least one option.');
    }
    this.props.options = options;
    this.props.updatedAt = new Date();
  }
}
