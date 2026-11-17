import { EnemQuestionCache } from '../../../application/content/ports/enem-question-cache';
import { EnemQuestion } from '../../../application/content/ports/enem-question-bank';

interface CacheEntry {
  expiresAt: number;
  questions: EnemQuestion[];
}

/**
 * Cache local ao processo, usado como implementação padrão, fallback do
 * Redis e test double. A expiração é verificada na leitura.
 */
export class InMemoryEnemQuestionCache implements EnemQuestionCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  get(key: string): Promise<EnemQuestion[] | null> {
    const entry = this.entries.get(key);

    if (!entry) {
      return Promise.resolve(null);
    }

    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return Promise.resolve(null);
    }

    return Promise.resolve(entry.questions);
  }

  set(key: string, questions: EnemQuestion[], ttlMs: number): Promise<void> {
    this.entries.set(key, {
      expiresAt: this.now() + ttlMs,
      questions,
    });

    return Promise.resolve();
  }

  clear(): void {
    this.entries.clear();
  }
}
