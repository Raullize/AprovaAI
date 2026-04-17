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
});
