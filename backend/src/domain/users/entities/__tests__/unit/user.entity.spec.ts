import { User } from '../../user.entity';
import { Email } from '../../../value-objects/email';

describe('User Entity', () => {
  it('should be able to create a user', () => {
    const email = Email.create('john.doe@example.com');
    const user = User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: email,
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1990-01-01'),
    });

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.fullName).toBe('John Doe');
    expect(user.email.value).toBe('john.doe@example.com');
    expect(user.subscriptionPlan).toBe('FREE');
    expect(user.role).toBe('STUDENT');
    expect(user.xp).toBe(0);
  });

  it('should create a user with custom props', () => {
    const email = Email.create('jane.doe@example.com');
    const user = User.create({
      fullName: 'Jane Doe',
      username: 'janedoe',
      email: email,
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1995-01-01'),
      subscriptionPlan: 'PREMIUM',
      role: 'ADMIN',
      xp: 100,
    });

    expect(user.subscriptionPlan).toBe('PREMIUM');
    expect(user.role).toBe('ADMIN');
    expect(user.xp).toBe(100);
  });

  it('should grant xp to a user', () => {
    const email = Email.create('john.doe@example.com');
    const user = User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: email,
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1990-01-01'),
      xp: 10,
    });

    user.grantXp(20);

    expect(user.xp).toBe(30);
    expect(user.updatedAt).toBeDefined();
  });

  it('should not allow negative xp grant', () => {
    const email = Email.create('john.doe@example.com');
    const user = User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: email,
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1990-01-01'),
    });

    expect(() => {
      user.grantXp(-10);
    }).toThrow('XP amount must be positive.');
  });

  it('should change password', () => {
    const email = Email.create('john.doe@example.com');
    const user = User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: email,
      passwordHash: 'old-password',
      dateOfBirth: new Date('1990-01-01'),
    });

    user.changePassword('new-password');

    expect(user.passwordHash).toBe('new-password');
  });

  it('should upgrade to premium', () => {
    const email = Email.create('john.doe@example.com');
    const user = User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: email,
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1990-01-01'),
      subscriptionPlan: 'FREE',
    });

    user.upgradeToPremium();

    expect(user.subscriptionPlan).toBe('PREMIUM');
  });

  describe('streak count and best streak', () => {
    it('should initialize with default streak stats', () => {
      const email = Email.create('john.doe@example.com');
      const user = User.create({
        fullName: 'John Doe',
        username: 'johndoe',
        email,
        passwordHash: 'hashed-password',
        dateOfBirth: new Date('1990-01-01'),
      });

      expect(user.streakCount).toBe(0);
      expect(user.bestStreak).toBe(0);
      expect(user.lastActiveAt).toBeNull();
    });

    it('should initialize with custom streak stats', () => {
      const email = Email.create('john.doe@example.com');
      const user = User.create({
        fullName: 'John Doe',
        username: 'johndoe',
        email,
        passwordHash: 'hashed-password',
        dateOfBirth: new Date('1990-01-01'),
        streakCount: 3,
        bestStreak: 5,
        lastActiveAt: new Date('2026-06-20'),
      });

      expect(user.streakCount).toBe(3);
      expect(user.bestStreak).toBe(5);
      expect(user.lastActiveAt).toEqual(new Date('2026-06-20'));
    });

    it('should update bestStreak when streakCount exceeds it', () => {
      const email = Email.create('john.doe@example.com');
      const user = User.create({
        fullName: 'John Doe',
        username: 'johndoe',
        email,
        passwordHash: 'hashed-password',
        dateOfBirth: new Date('1990-01-01'),
        streakCount: 2,
        bestStreak: 2,
        lastActiveAt: new Date('2026-06-20'),
      });

      // Atividade no dia seguinte (incrementa streak de 2 para 3)
      const success = user.updateStreak(new Date('2026-06-21'));
      expect(success).toBe(true);
      expect(user.streakCount).toBe(3);
      expect(user.bestStreak).toBe(3);
    });

    it('should not update bestStreak if streakCount does not exceed it', () => {
      const email = Email.create('john.doe@example.com');
      const user = User.create({
        fullName: 'John Doe',
        username: 'johndoe',
        email,
        passwordHash: 'hashed-password',
        dateOfBirth: new Date('1990-01-01'),
        streakCount: 1,
        bestStreak: 5,
        lastActiveAt: new Date('2026-06-20'),
      });

      // Atividade no dia seguinte (incrementa de 1 para 2)
      const success = user.updateStreak(new Date('2026-06-21'));
      expect(success).toBe(true);
      expect(user.streakCount).toBe(2);
      expect(user.bestStreak).toBe(5); // Mantém o recorde de 5
    });

    it('should reset streakCount but preserve/update bestStreak if streak is broken', () => {
      const email = Email.create('john.doe@example.com');
      const user = User.create({
        fullName: 'John Doe',
        username: 'johndoe',
        email,
        passwordHash: 'hashed-password',
        dateOfBirth: new Date('1990-01-01'),
        streakCount: 4,
        bestStreak: 4,
        lastActiveAt: new Date('2026-06-15'),
      });

      // Atividade vários dias depois (streak quebrado, reseta pra 1)
      const success = user.updateStreak(new Date('2026-06-20'));
      expect(success).toBe(true);
      expect(user.streakCount).toBe(1);
      expect(user.bestStreak).toBe(4); // Mantém o recorde antigo
    });
  });
});
