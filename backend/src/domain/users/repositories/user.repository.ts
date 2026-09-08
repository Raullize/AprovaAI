import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract create(user: User): Promise<User>;
  abstract save(user: User): Promise<User>;
  abstract logActivity(userId: string, date: Date): Promise<void>;
  abstract findActivitiesByUserIdAndMonth(
    userId: string,
    month: Date,
  ): Promise<Date[]>;
  abstract findLeaderboard(limit: number): Promise<User[]>;
  abstract findStreakLeaderboard(limit: number): Promise<User[]>;
  abstract findUserRankByXp(userId: string): Promise<number>;
  abstract findUserRankByStreak(userId: string): Promise<number>;
  abstract delete(id: string): Promise<void>;
}
