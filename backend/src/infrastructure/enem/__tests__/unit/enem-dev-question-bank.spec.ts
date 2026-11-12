import { EnemDevQuestionBank } from '../../enem-dev-question-bank';

function jsonResponse(
  body: unknown,
  options: { status?: number; headers?: Record<string, string> } = {},
): Response {
  const status = options.status ?? 200;

  return {
    ok: status < 400,
    status,
    headers: new Headers(options.headers ?? {}),
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function buildQuestion(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Questão 1 - ENEM 2023',
    index: 1,
    discipline: 'matematica',
    language: null,
    year: 2023,
    context: '**Texto** de apoio com [link](https://example.com).',
    files: [],
    correctAlternative: 'B',
    alternativesIntroduction: 'Qual é a resposta correta?',
    alternatives: [
      { letter: 'A', text: 'Alternativa A', isCorrect: false },
      { letter: 'B', text: 'Alternativa B', isCorrect: true },
      { letter: 'C', text: 'Alternativa C', isCorrect: false },
      { letter: 'D', text: 'Alternativa D', isCorrect: false },
      { letter: 'E', text: 'Alternativa E', isCorrect: false },
    ],
    ...overrides,
  };
}

describe('EnemDevQuestionBank', () => {
  it('should normalize questions and skip questions with images', async () => {
    const fetchImpl = jest.fn(() =>
      Promise.resolve(
        jsonResponse({
          metadata: { limit: 50, offset: 0, total: 3, hasMore: false },
          questions: [
            buildQuestion(),
            buildQuestion({
              index: 2,
              context: 'Texto com imagem ![figura](https://enem.dev/image.png)',
            }),
            buildQuestion({
              index: 3,
              files: ['https://enem.dev/file.png'],
            }),
          ],
        }),
      ),
    );

    const bank = new EnemDevQuestionBank({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      minIntervalMs: 0,
      random: () => 0,
    });

    const questions = await bank.fetchQuestions({
      discipline: 'matematica',
      years: [2023],
      limit: 10,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url] = fetchImpl.mock.calls[0];
    expect(url).toContain('/exams/2023/questions');
    expect(url).not.toContain('discipline=');
    expect(url).not.toContain('language=');

    expect(questions).toHaveLength(1);
    expect(questions[0].sourceRef).toBe('enem:2023:1');
    expect(questions[0].content).toContain('Texto de apoio com link.');
    expect(questions[0].content).not.toContain('**');
    expect(questions[0].content).toContain('Qual é a resposta correta?');
    expect(
      questions[0].options.filter((option) => option.isCorrect),
    ).toHaveLength(1);
  });

  it('should filter by discipline locally and paginate through the year', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          metadata: { limit: 50, offset: 0, total: 100, hasMore: true },
          questions: [
            buildQuestion({
              index: 1,
              discipline: 'linguagens',
              language: 'espanhol',
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          metadata: { limit: 50, offset: 50, total: 100, hasMore: false },
          questions: [buildQuestion({ index: 51 })],
        }),
      );

    const bank = new EnemDevQuestionBank({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      minIntervalMs: 0,
    });

    const questions = await bank.fetchQuestions({
      discipline: 'matematica',
      years: [2023],
      limit: 1,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const calls = fetchImpl.mock.calls as unknown as Array<[string]>;
    const firstUrl = calls[0][0];
    const secondUrl = calls[1][0];
    expect(firstUrl).toContain('offset=0');
    expect(secondUrl).toContain('offset=50');
    expect(questions).toHaveLength(1);
    expect(questions[0].discipline).toBe('matematica');
    expect(questions[0].sourceRef).toBe('enem:2023:51');
  });

  it('should filter Linguagens by language locally', async () => {
    const fetchImpl = jest.fn(() =>
      Promise.resolve(
        jsonResponse({
          metadata: { limit: 50, offset: 0, total: 3, hasMore: false },
          questions: [
            buildQuestion({
              index: 1,
              discipline: 'linguagens',
              language: 'espanhol',
            }),
            buildQuestion({
              index: 2,
              discipline: 'linguagens',
              language: 'ingles',
            }),
          ],
        }),
      ),
    );

    const bank = new EnemDevQuestionBank({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      minIntervalMs: 0,
    });

    const questions = await bank.fetchQuestions({
      discipline: 'linguagens',
      years: [2023],
      language: 'espanhol',
      limit: 10,
    });

    expect(questions).toHaveLength(1);
    expect(questions[0].language).toBe('espanhol');
    const [url] = fetchImpl.mock.calls[0];
    expect(url).not.toContain('language=');
  });

  it('should cache questions for the same year, discipline and language', async () => {
    const fetchImpl = jest.fn(() =>
      Promise.resolve(
        jsonResponse({
          metadata: { limit: 50, offset: 0, total: 0, hasMore: false },
          questions: [],
        }),
      ),
    );

    const bank = new EnemDevQuestionBank({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      minIntervalMs: 0,
    });

    await bank.fetchQuestions({
      discipline: 'matematica',
      years: [2023],
      limit: 10,
    });
    await bank.fetchQuestions({
      discipline: 'matematica',
      years: [2023],
      limit: 10,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('should retry once after a 429 response', async () => {
    const sleep = jest.fn(() => Promise.resolve());
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { message: 'rate limit' },
          { status: 429, headers: { 'retry-after': '10' } },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          metadata: { limit: 50, offset: 0, total: 0, hasMore: false },
          questions: [],
        }),
      );

    const bank = new EnemDevQuestionBank({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep,
      minIntervalMs: 0,
    });

    await bank.fetchQuestions({
      discipline: 'matematica',
      years: [2023],
      limit: 10,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(10);
  });
});
