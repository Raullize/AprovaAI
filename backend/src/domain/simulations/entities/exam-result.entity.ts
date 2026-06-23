import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Entity } from '../../../shared/core/entity';

export type SimulationStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type SimulationMode = 'PRACTICE' | 'EXAM';

export interface ExamAnswerProps {
  examResultId: string;
  questionId: string;
  selectedOptions: string[];
  isCorrect?: boolean | null;
  timeSpent?: number | null;
  isFlaggedForReview?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExamAnswer extends Entity<ExamAnswerProps> {
  get examResultId(): string {
    return this.props.examResultId;
  }
  get questionId(): string {
    return this.props.questionId;
  }
  get selectedOptions(): string[] {
    return this.props.selectedOptions;
  }
  get isCorrect(): boolean | null | undefined {
    return this.props.isCorrect;
  }
  get timeSpent(): number | null | undefined {
    return this.props.timeSpent;
  }
  get isFlaggedForReview(): boolean {
    return this.props.isFlaggedForReview ?? false;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static create(props: ExamAnswerProps, id?: string): ExamAnswer {
    return new ExamAnswer(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }
}

export interface ExamResultLevel {
  name: string;
  xpReward?: number;
  topic?: {
    name: string;
    exam?: {
      id?: string;
      slug?: string;
      name: string;
      category?: string;
      iconKey?: string;
      colorScheme?: string;
    };
  };
}

export interface ExamResultProps {
  userId: string;
  levelId: string;
  status?: SimulationStatus;
  mode?: SimulationMode;
  score?: number | null;
  totalQuestions: number;
  percentage?: number | null;
  passed?: boolean | null;
  stars?: number | null;
  timeSpent?: number | null;
  answers?: ExamAnswer[];
  level?: ExamResultLevel | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExamResult extends AggregateRoot<ExamResultProps> {
  get userId(): string {
    return this.props.userId;
  }
  get levelId(): string {
    return this.props.levelId;
  }
  get status(): SimulationStatus {
    return this.props.status ?? 'IN_PROGRESS';
  }
  get mode(): SimulationMode {
    return this.props.mode ?? 'PRACTICE';
  }
  get score(): number | null | undefined {
    return this.props.score;
  }
  get totalQuestions(): number {
    return this.props.totalQuestions;
  }
  get percentage(): number | null | undefined {
    return this.props.percentage;
  }
  get passed(): boolean | null | undefined {
    return this.props.passed;
  }
  get stars(): number | null | undefined {
    return this.props.stars;
  }
  get timeSpent(): number | null | undefined {
    return this.props.timeSpent;
  }
  get answers(): ExamAnswer[] {
    return this.props.answers ?? [];
  }
  get level(): ExamResultLevel | null | undefined {
    return this.props.level;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static create(props: ExamResultProps, id?: string): ExamResult {
    return new ExamResult(
      {
        ...props,
        status: props.status ?? 'IN_PROGRESS',
        stars: props.stars ?? null,
        answers: props.answers ?? [],
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }
}
