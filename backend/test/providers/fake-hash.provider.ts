import { HashProvider } from '../../src/application/auth/ports/hash-provider';

export class FakeHashProvider implements HashProvider {
  async hash(payload: string): Promise<string> {
    return `hashed:${payload}`;
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return hashed === `hashed:${payload}`;
  }
}
