import { User } from '../../src/domain/users/entities/user.entity';
import { UserRepository } from '../../src/domain/users/repositories/user.repository';
import { DomainEvents } from '../../src/shared/core/events/domain-events';

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];
  public activities: Array<{ userId: string; date: Date }> = [];

  findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id);
    return Promise.resolve(user || null);
  }

  findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email.value === email);
    return Promise.resolve(user || null);
  }

  findByUsername(username: string): Promise<User | null> {
    const user = this.items.find((item) => item.username === username);
    return Promise.resolve(user || null);
  }

  create(user: User): Promise<User> {
    this.items.push(user);
    DomainEvents.dispatchEventsForAggregate(user.id);
    return Promise.resolve(user);
  }

  save(user: User): Promise<User> {
    const index = this.items.findIndex((item) => item.id === user.id);

    if (index >= 0) {
      this.items[index] = user;
    } else {
      this.items.push(user);
    }

    return Promise.resolve(user);
  }

  logActivity(userId: string, date: Date): Promise<void> {
    const truncatedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const alreadyExists = this.activities.some(
      (activity) =>
        activity.userId === userId &&
        activity.date.getTime() === truncatedDate.getTime(),
    );

    if (!alreadyExists) {
      this.activities.push({ userId, date: truncatedDate });
    }

    return Promise.resolve();
  }

  findActivitiesByUserIdAndMonth(userId: string, month: Date): Promise<Date[]> {
    const dates = this.activities
      .filter(
        (activity) =>
          activity.userId === userId &&
          activity.date.getMonth() === month.getMonth() &&
          activity.date.getFullYear() === month.getFullYear(),
      )
      .map((activity) => activity.date);

    return Promise.resolve(dates);
  }

  findLeaderboard(limit: number): Promise<User[]> {
    const users = [...this.items]
      .filter((user) => user.role === 'STUDENT')
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit);

    return Promise.resolve(users);
  }

  findStreakLeaderboard(limit: number): Promise<User[]> {
    const users = [...this.items]
      .filter((user) => user.role === 'STUDENT')
      .sort((a, b) => b.bestStreak - a.bestStreak)
      .slice(0, limit);

    return Promise.resolve(users);
  }

  findUserRankByXp(userId: string): Promise<number> {
    const target = this.items.find((u) => u.id === userId);
    if (!target) return Promise.resolve(-1);
    const rank =
      this.items.filter((u) => u.role === 'STUDENT' && u.xp > target.xp)
        .length + 1;
    return Promise.resolve(rank);
  }

  findUserRankByStreak(userId: string): Promise<number> {
    const target = this.items.find((u) => u.id === userId);
    if (!target) return Promise.resolve(-1);
    const rank =
      this.items.filter(
        (u) => u.role === 'STUDENT' && u.bestStreak > target.bestStreak,
      ).length + 1;
    return Promise.resolve(rank);
  }

  delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
    this.activities = this.activities.filter(
      (activity) => activity.userId !== id,
    );
    return Promise.resolve();
  }
}
