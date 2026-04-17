import { User as PrismaUser } from '@prisma/client';
import { User } from '../../../../domain/users/entities/user.entity';
import { Email } from '../../../../domain/users/value-objects/email';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        fullName: raw.fullName,
        username: raw.username,
        email: Email.create(raw.email),
        passwordHash: raw.passwordHash,
        dateOfBirth: raw.dateOfBirth,
        subscriptionPlan: raw.subscriptionPlan,
        role: raw.role,
        xp: raw.xp,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email.value,
      passwordHash: user.passwordHash,
      dateOfBirth: user.dateOfBirth,
      subscriptionPlan: user.subscriptionPlan,
      role: user.role,
      xp: user.xp,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
    };
  }
}
