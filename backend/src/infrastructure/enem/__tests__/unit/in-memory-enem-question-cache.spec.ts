import { EnemQuestion } from '../../../../application/content/ports/enem-question-bank';
import { InMemoryEnemQuestionCache } from '../../cache/in-memory-enem-question-cache';

const question: EnemQuestion = {
  sourceRef: 'enem:2023:1',
  year: 2023,
  index: 1,
  discipline: 'matematica',
  language: null,
  content: 'Questão de teste',
  options: [
    { text: 'Alternativa A', isCorrect: false },
    { text: 'Alternativa B', isCorrect: true },
  ],
};

describe('InMemoryEnemQuestionCache', () => {
  it('should store and retrieve questions by key', async () => {
    const cache = new InMemoryEnemQuestionCache();
    const key = 'aprovaai:enem:v1:2023:matematica:all';

    await cache.set(key, [question], 10_000);

    await expect(cache.get(key)).resolves.toEqual([question]);
    await expect(cache.get('outra-chave')).resolves.toBeNull();
  });

  it('should expire entries after the TTL', async () => {
    let now = 1_000;
    const cache = new InMemoryEnemQuestionCache(() => now);
    const key = 'aprovaai:enem:v1:2023:matematica:all';

    await cache.set(key, [question], 500);

    now = 1_499;
    await expect(cache.get(key)).resolves.toEqual([question]);

    now = 1_500;
    await expect(cache.get(key)).resolves.toBeNull();
  });
});
