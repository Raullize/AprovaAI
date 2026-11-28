import { Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';

/**
 * Subconjunto do cliente `redis` usado pela aplicação. Tipar apenas o que
 * consumimos evita acoplar o código aos genéricos internos da biblioteca.
 */
export interface RedisClient {
  readonly isReady: boolean;
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options: { PX: number } | { NX: true; PX: number },
  ): Promise<string | null>;
  pTTL(key: string): Promise<number>;
  del(keys: string[]): Promise<number>;
  quit(): Promise<string>;
  destroy(): void;
}

export interface RedisConnectionOptions {
  url?: string;
  connectTimeoutMs?: number;
  retryCooldownMs?: number;
  now?: () => number;
}

const DEFAULT_CONNECT_TIMEOUT_MS = 1500;
const DEFAULT_RETRY_COOLDOWN_MS = 30_000;

/**
 * Conexão Redis preguiçosa e tolerante a falhas.
 *
 * - Não conecta no boot: só na primeira operação que precise do Redis.
 * - Se a conexão falhar, entra em cooldown e devolve `null`, permitindo que
 *   os adapters usem o fallback em memória sem travar a requisição.
 * - Fecha a conexão no shutdown do módulo Nest.
 */
export class RedisConnection implements OnModuleDestroy {
  private readonly logger = new Logger(RedisConnection.name);
  private readonly url?: string;
  private readonly connectTimeoutMs: number;
  private readonly retryCooldownMs: number;
  private readonly now: () => number;

  private client: RedisClient | null = null;
  private connecting: Promise<RedisClient | null> | null = null;
  private unavailableUntil = 0;
  private lastErrorLogAt = 0;

  constructor(options: RedisConnectionOptions = {}) {
    this.url = options.url?.trim() || undefined;
    this.connectTimeoutMs =
      options.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS;
    this.retryCooldownMs = options.retryCooldownMs ?? DEFAULT_RETRY_COOLDOWN_MS;
    this.now = options.now ?? (() => Date.now());
  }

  isConfigured(): boolean {
    return Boolean(this.url);
  }

  async getClient(): Promise<RedisClient | null> {
    if (this.client?.isReady) {
      return this.client;
    }

    if (!this.url || this.now() < this.unavailableUntil) {
      return null;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this.connect();

    try {
      return await this.connecting;
    } finally {
      this.connecting = null;
    }
  }

  async close(): Promise<void> {
    const client = this.client;
    this.client = null;

    if (!client) {
      return;
    }

    try {
      await client.quit();
    } catch {
      client.destroy();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  private async connect(): Promise<RedisClient | null> {
    if (this.client && !this.client.isReady) {
      this.client.destroy();
      this.client = null;
    }

    const client = createClient({
      url: this.url,
      socket: {
        connectTimeout: this.connectTimeoutMs,
        reconnectStrategy: false,
      },
    });

    client.on('error', (error) => {
      this.logFailure('Erro na conexão com o Redis', error);
    });

    try {
      await client.connect();
      this.client = client;
      this.unavailableUntil = 0;
      this.logger.log('Conexão com o Redis estabelecida.');
      return client;
    } catch (error) {
      client.destroy();
      this.unavailableUntil = this.now() + this.retryCooldownMs;
      this.logFailure(
        'Redis indisponível; usando fallback local em memória',
        error,
      );
      return null;
    }
  }

  private logFailure(message: string, error: unknown): void {
    const now = this.now();

    if (now - this.lastErrorLogAt < this.retryCooldownMs) {
      return;
    }

    this.lastErrorLogAt = now;
    const detail = error instanceof Error ? error.message : String(error);
    this.logger.warn(`${message} (${detail})`);
  }
}
