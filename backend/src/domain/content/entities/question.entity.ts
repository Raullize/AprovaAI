import { Entity } from '../../../shared/core/entity';

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

export class Question extends Entity<QuestionProps> {
  get content() {
    return this.props.content;
  }
  get imageUrl() {
    return this.props.imageUrl;
  }
  get type() {
    return this.props.type ?? 'MULTIPLE_CHOICE';
  }
  get status() {
    return this.props.status ?? 'ACTIVE';
  }
  get order() {
    return this.props.order;
  }
  get explanation() {
    return this.props.explanation;
  }
  get studyLink() {
    return this.props.studyLink;
  }
  get levelId() {
    return this.props.levelId;
  }
  get options() {
    return this.props.options ?? [];
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
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
}
