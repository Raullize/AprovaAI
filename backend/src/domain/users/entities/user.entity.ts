import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Email } from '../value-objects/email';

export interface UserProps {
  fullName: string;
  username: string;
  email: Email;
  passwordHash: string;
  dateOfBirth: Date;
  subscriptionPlan?: 'FREE' | 'PREMIUM';
  role?: 'USER' | 'ADMIN';
  xp?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends AggregateRoot<UserProps> {
  get fullName(): string {
    return this.props.fullName;
  }
  get username(): string {
    return this.props.username;
  }
  get email(): Email {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get dateOfBirth(): Date {
    return this.props.dateOfBirth;
  }
  get subscriptionPlan(): 'FREE' | 'PREMIUM' {
    return this.props.subscriptionPlan ?? 'FREE';
  }
  get role(): 'USER' | 'ADMIN' {
    return this.props.role ?? 'USER';
  }
  get xp(): number {
    return this.props.xp ?? 0;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static create(props: UserProps, id?: string): User {
    return new User(
      {
        ...props,
        subscriptionPlan: props.subscriptionPlan ?? 'FREE',
        role: props.role ?? 'USER',
        xp: props.xp ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }
}
