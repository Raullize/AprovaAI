import { User } from '../../src/domain/users/entities/user.entity';
import { UserRepository } from '../../src/domain/users/repositories/user.repository';
import { DomainEvents } from '../../src/shared/core/events/domain-events';

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

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
}
