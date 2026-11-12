import {
  EnemDiscipline,
  EnemLanguage,
  EnemQuestion,
  EnemQuestionBank,
  EnemQuestionFilter,
} from '../../application/content/ports/enem-question-bank';

interface EnemDevAlternative {
  letter?: string;
  text?: string;
  isCorrect?: boolean;
  file?: string | null;
}

interface EnemDevQuestion {
  title?: string;
  index: number;
  discipline: EnemDiscipline;
  language?: EnemLanguage | null;
  year: number;
  context?: string;
  files?: string[] | null;
  correctAlternative?: string;
  alternativesIntroduction?: string;
  alternatives?: EnemDevAlternative[];
}

interface EnemDevQuestionsResponse {
  metadata?: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  questions?: EnemDevQuestion[];
}

export interface EnemDevQuestionBankOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
  minIntervalMs?: number;
  cacheTtlMs?: number;
  pageSize?: number;
  now?: () => number;
}

const DEFAULT_BASE_URL = 'https://api.enem.dev/v1';
const DEFAULT_MIN_INTERVAL_MS = 1100;
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGES_PER_YEAR = 20;

export class EnemDevQuestionBank extends EnemQuestionBank {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly random: () => number;
  private readonly minIntervalMs: number;
  private readonly cacheTtlMs: number;
  private readonly pageSize: number;
  private readonly now: () => number;
  private readonly cache = new Map<
    string,
    { expiresAt: number; questions: EnemQuestion[] }
  >();
  private lastRequestAt = 0;

  constructor(options: EnemDevQuestionBankOptions = {}) {
    super();
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.sleep =
      options.sleep ??
      ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.random = options.random ?? Math.random;
    this.minIntervalMs = options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
    this.now = options.now ?? (() => Date.now());
  }

  async fetchQuestions(filter: EnemQuestionFilter): Promise<EnemQuestion[]> {
    const years = this.shuffle([...new Set(filter.years)]);
    const collected: EnemQuestion[] = [];

    for (const year of years) {
      const questions = await this.getYearQuestions(year, filter);
      collected.push(...questions);

      if (collected.length >= filter.limit) {
        break;
      }
    }

    return this.shuffle(collected).slice(0, filter.limit);
  }

  private async getYearQuestions(
    year: number,
    filter: EnemQuestionFilter,
  ): Promise<EnemQuestion[]> {
    const cacheKey = this.buildCacheKey(year, filter);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > this.now()) {
      return cached.questions;
    }

    const questions = await this.fetchYear(year, filter);
    this.cache.set(cacheKey, {
      expiresAt: this.now() + this.cacheTtlMs,
      questions,
    });

    return questions;
  }

  private async fetchYear(
    year: number,
    filter: EnemQuestionFilter,
  ): Promise<EnemQuestion[]> {
    const collected: EnemQuestion[] = [];
    let offset = 0;
    let hasMore = true;
    let pages = 0;

    while (
      hasMore &&
      collected.length < filter.limit &&
      pages < MAX_PAGES_PER_YEAR
    ) {
      const params = new URLSearchParams({
        limit: String(this.pageSize),
        offset: String(offset),
      });

      const response = await this.request<EnemDevQuestionsResponse>(
        `${this.baseUrl}/exams/${year}/questions?${params.toString()}`,
      );

      const questions = response.questions ?? [];

      for (const question of questions) {
        if (!this.matchesFilter(question, filter)) {
          continue;
        }

        const normalized = this.normalize(question);
        if (normalized) {
          collected.push(normalized);
        }
      }

      hasMore =
        response.metadata?.hasMore ?? questions.length === this.pageSize;
      offset += this.pageSize;
      pages += 1;

      if (questions.length === 0) {
        break;
      }
    }

    return collected;
  }

  private matchesFilter(
    question: EnemDevQuestion,
    filter: EnemQuestionFilter,
  ): boolean {
    if (question.discipline !== filter.discipline) {
      return false;
    }

    if (
      filter.discipline === 'linguagens' &&
      filter.language &&
      question.language !== filter.language
    ) {
      return false;
    }

    return true;
  }

  private async request<T>(url: string): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.waitForRateLimit();

      const response = await this.fetchImpl(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      this.lastRequestAt = this.now();

      if (response.status === 429 && attempt === 0) {
        const retryAfter = Number(response.headers.get('retry-after'));
        await this.sleep(
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 2000,
        );
        continue;
      }

      if (!response.ok) {
        throw new Error(`enem.dev respondeu ${response.status}`);
      }

      return (await response.json()) as T;
    }

    throw new Error('enem.dev excedeu o limite de requisições');
  }

  private async waitForRateLimit(): Promise<void> {
    const elapsed = this.now() - this.lastRequestAt;
    if (elapsed < this.minIntervalMs) {
      await this.sleep(this.minIntervalMs - elapsed);
    }
  }

  private normalize(raw: EnemDevQuestion): EnemQuestion | null {
    const context = raw.context ?? '';
    const introduction = raw.alternativesIntroduction ?? '';

    if (raw.files && raw.files.length > 0) {
      return null;
    }

    if (hasMarkdownImage(context) || hasMarkdownImage(introduction)) {
      return null;
    }

    const alternatives = raw.alternatives ?? [];
    if (alternatives.length < 2) {
      return null;
    }

    const options = alternatives
      .map((alternative) => ({
        text: stripMarkdown(alternative.text ?? '').trim(),
        isCorrect:
          alternative.isCorrect === true ||
          (alternative.letter ?? '') === (raw.correctAlternative ?? ''),
      }))
      .filter((option) => option.text.length > 0);

    if (
      options.length < 2 ||
      options.filter((option) => option.isCorrect).length !== 1
    ) {
      return null;
    }

    const content = stripMarkdown(
      [context, introduction].filter(Boolean).join('\n\n'),
    ).trim();

    if (!content) {
      return null;
    }

    return {
      sourceRef: `enem:${raw.year}:${raw.index}`,
      year: raw.year,
      index: raw.index,
      discipline: raw.discipline,
      language: raw.language ?? null,
      content,
      options,
    };
  }

  private buildCacheKey(year: number, filter: EnemQuestionFilter): string {
    return `${year}:${filter.discipline}:${filter.language ?? 'all'}`;
  }

  private shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }

    return result;
  }
}

function hasMarkdownImage(value: string): boolean {
  return /!\[[^\]]*\]\([^)]*\)/.test(value);
}

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
