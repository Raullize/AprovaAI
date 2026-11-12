export type EnemDiscipline =
  'ciencias-humanas' | 'ciencias-natureza' | 'linguagens' | 'matematica';

export type EnemLanguage = 'ingles' | 'espanhol';

export interface EnemQuestionFilter {
  discipline: EnemDiscipline;
  years: number[];
  language?: EnemLanguage;
  limit: number;
}

export interface EnemQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface EnemQuestion {
  sourceRef: string;
  year: number;
  index: number;
  discipline: EnemDiscipline;
  language?: EnemLanguage | null;
  content: string;
  options: EnemQuestionOption[];
}

export abstract class EnemQuestionBank {
  abstract fetchQuestions(filter: EnemQuestionFilter): Promise<EnemQuestion[]>;
}
