import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Entity } from '../../../shared/core/entity';

export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type SimulationMode = 'PRACTICE' | 'EXAM';

export interface AttemptAnswerProps {
  simulationAttemptId: string;
  questionId: string;
  selectedOptions: string[];
  isCorrect?: boolean | null;
  timeSpent?: number | null;
  isFlaggedForReview?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AttemptAnswer extends Entity<AttemptAnswerProps> {
  get simulationAttemptId(): string {
    return this.props.simulationAttemptId;
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

  static create(props: AttemptAnswerProps, id?: string): AttemptAnswer {
    return new AttemptAnswer(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }
}

export interface AttemptSimulation {
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

export interface SimulationAttemptProps {
  userId: string;
  simulationId: string;
  status?: AttemptStatus;
  mode?: SimulationMode;
  score?: number | null;
  totalQuestions: number;
  percentage?: number | null;
  passed?: boolean | null;
  stars?: number | null;
  timeSpent?: number | null;
  answers?: AttemptAnswer[];
  simulation?: AttemptSimulation | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SimulationAttempt extends AggregateRoot<SimulationAttemptProps> {
  get userId(): string {
    return this.props.userId;
  }
  get simulationId(): string {
    return this.props.simulationId;
  }
  get status(): AttemptStatus {
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
  get answers(): AttemptAnswer[] {
    return this.props.answers ?? [];
  }
  get simulation(): AttemptSimulation | null | undefined {
    return this.props.simulation;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static create(props: SimulationAttemptProps, id?: string): SimulationAttempt {
    return new SimulationAttempt(
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
