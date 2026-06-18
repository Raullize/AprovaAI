import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRepository } from '../../../../domain/users/repositories/user.repository';
import { User } from '../../../../domain/users/entities/user.entity';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async create(user: User): Promise<User> {
    const data = PrismaUserMapper.toPrisma(user);

    const created = await this.prisma.user.create({
      data,
    });

    return PrismaUserMapper.toDomain(created);
  }

  async save(user: User): Promise<User> {
    const data = PrismaUserMapper.toPrisma(user);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });

    return PrismaUserMapper.toDomain(updated);
  }

  async logActivity(userId: string, date: Date): Promise<void> {
    const truncateDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    await this.prisma.userActivity.upsert({
      where: {
        userId_date: {
          userId,
          date: truncateDate,
        },
      },
      create: {
        userId,
        date: truncateDate,
      },
      update: {},
    });
  }

  async findActivitiesByUserIdAndMonth(userId: string, month: Date): Promise<Date[]> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
    const activities = await this.prisma.userActivity.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        date: true,
      },
    });
    return activities.map((act) => act.date);
  }

  async findLeaderboard(limit: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
    });
    return users.map((u) => PrismaUserMapper.toDomain(u));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
