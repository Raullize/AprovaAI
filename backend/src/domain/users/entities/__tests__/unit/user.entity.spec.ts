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
    expect(user.role).toBe('USER');
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
});
