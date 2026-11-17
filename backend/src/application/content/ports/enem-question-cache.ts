import { EnemQuestion } from './enem-question-bank';

/**
 * Cache de questões do ENEM por ano, disciplina e idioma.
 *
 * A porta não conhece Redis nem memória: apenas armazena e recupera
 * listas já normalizadas de questões com um TTL em milissegundos.
 */
export abstract class EnemQuestionCache {
  abstract get(key: string): Promise<EnemQuestion[] | null>;

  abstract set(
    key: string,
    questions: EnemQuestion[],
    ttlMs: number,
  ): Promise<void>;
}
