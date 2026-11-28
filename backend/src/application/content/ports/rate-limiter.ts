/**
 * Limitador de requisições baseado em uma chave compartilhada.
 *
 * `acquire` espera até que seja seguro disparar a próxima requisição e
 * reserva a janela de tempo. A implementação pode ser local ao processo
 * (memória) ou distribuída (Redis).
 */
export abstract class RateLimiter {
  abstract acquire(key: string, intervalMs: number): Promise<void>;
}
