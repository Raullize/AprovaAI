import { buildSystemPrompt } from '../../chat.prompt';

describe('buildSystemPrompt', () => {
  it('should include the student knowledge base and the admin restriction', () => {
    const prompt = buildSystemPrompt();

    expect(prompt).toContain('Professor Sabichão');
    expect(prompt).toContain('AprovaAI');
    expect(prompt).toContain('Modo Treino');
    expect(prompt).toContain('administrativo');
    expect(prompt).toContain('Nunca mencione');
  });

  it('should include the published exams catalog when provided', () => {
    const prompt = buildSystemPrompt({
      exams: [
        { name: 'ENEM', category: 'CONCURSOS', topicsCount: 4 },
        {
          name: 'AWS Cloud Practitioner',
          category: 'CERTIFICACOES',
          topicsCount: 2,
        },
      ],
    });

    expect(prompt).toContain('Exames disponíveis na plataforma');
    expect(prompt).toContain('ENEM (CONCURSOS) — 4 tópico(s)');
    expect(prompt).toContain(
      'AWS Cloud Practitioner (CERTIFICACOES) — 2 tópico(s)',
    );
  });

  it('should not include the catalog section when there are no exams', () => {
    const prompt = buildSystemPrompt({ exams: [] });

    expect(prompt).not.toContain('Exames disponíveis na plataforma');
  });
});
