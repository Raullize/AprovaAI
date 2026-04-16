import { Entity } from '../../../shared/core/entity';

export interface UserProps {
  fullName: string;
  username: string;
  email: string;
  passwordHash: string;
  dateOfBirth: Date;
  subscriptionPlan?: 'FREE' | 'PREMIUM';
  role?: 'USER' | 'ADMIN';
  xp?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  get fullName() {
    return this.props.fullName;
  }
  get username() {
    return this.props.username;
  }
  get email() {
    return this.props.email;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get dateOfBirth() {
    return this.props.dateOfBirth;
  }
  get subscriptionPlan() {
    return this.props.subscriptionPlan ?? 'FREE';
  }
  get role() {
    return this.props.role ?? 'USER';
  }
  get xp() {
    return this.props.xp ?? 0;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
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
