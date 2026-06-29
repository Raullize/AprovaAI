import { AggregateRoot } from '../../../shared/core/aggregate-root';
import { Email } from '../value-objects/email';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface UserProps {
  fullName: string;
  username: string;
  email: Email;
  passwordHash: string;
  dateOfBirth: Date;
  subscriptionPlan?: 'FREE' | 'PREMIUM';
  role?: 'USER' | 'ADMIN';
  xp?: number;
  streakCount?: number;
  bestStreak?: number;
  lastActiveAt?: Date | null;
  avatarUrl?: string | null;
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
  get streakCount(): number {
    return this.props.streakCount ?? 0;
  }
  get bestStreak(): number {
    return this.props.bestStreak ?? 0;
  }
  get lastActiveAt(): Date | null | undefined {
    return this.props.lastActiveAt;
  }
  get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl;
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
        streakCount: props.streakCount ?? 0,
        bestStreak: props.bestStreak ?? 0,
        lastActiveAt: props.lastActiveAt ?? null,
        avatarUrl: props.avatarUrl ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public updateStreak(today: Date): boolean {
    const lastActive = this.props.lastActiveAt;

    // truncate dates to midnight for comparison
    const truncateDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayTrunc = truncateDate(today);

    if (!lastActive) {
      this.props.streakCount = 1;
      this.props.lastActiveAt = today;
      this.props.updatedAt = new Date();
      this._updateBestStreak();
      return true;
    }

    const lastActiveTrunc = truncateDate(lastActive);
    const diffTime = todayTrunc.getTime() - lastActiveTrunc.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      this.props.streakCount = (this.props.streakCount ?? 0) + 1;
      this.props.lastActiveAt = today;
      this.props.updatedAt = new Date();
      this._updateBestStreak();
      return true;
    } else if (diffDays > 1) {
      // Streak quebrado — persiste bestStreak antes de resetar
      this.props.streakCount = 1;
      this.props.lastActiveAt = today;
      this.props.updatedAt = new Date();
      this._updateBestStreak();
      return true;
    }

    return false;
  }

  /** Invariante de domínio: bestStreak sempre >= streakCount */
  private _updateBestStreak(): void {
    const current = this.props.streakCount ?? 0;
    const best = this.props.bestStreak ?? 0;
    if (current > best) {
      this.props.bestStreak = current;
    }
  }

  public grantXp(amount: number): void {
    if (amount < 0) {
      throw new ValidationError('XP amount must be positive.');
    }
    this.props.xp = (this.props.xp ?? 0) + amount;
    this.props.updatedAt = new Date();
  }

  public changePassword(newPasswordHash: string): void {
    this.props.passwordHash = newPasswordHash;
    this.props.updatedAt = new Date();
  }

  public upgradeToPremium(): void {
    this.props.subscriptionPlan = 'PREMIUM';
    this.props.updatedAt = new Date();
  }

  public changeFullName(fullName: string): void {
    if (!fullName || fullName.trim().length === 0) {
      throw new ValidationError('Nome completo não pode ser vazio.');
    }
    this.props.fullName = fullName;
    this.props.updatedAt = new Date();
  }

  public changeEmail(email: Email): void {
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  public changeUsername(username: string): void {
    if (!username || username.trim().length === 0) {
      throw new ValidationError('Nome de usuário não pode ser vazio.');
    }
    this.props.username = username;
    this.props.updatedAt = new Date();
  }

  public changeAvatarUrl(avatarUrl: string | null): void {
    this.props.avatarUrl = avatarUrl;
    this.props.updatedAt = new Date();
  }
}
