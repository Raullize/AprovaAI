export const EXAM_CATEGORY_LABELS: Record<string, string> = {
  CONCURSOS: 'Concursos',
  CERTIFICACOES: 'Certificações',
  VESTIBULAR: 'Vestibular',
  OAB: 'OAB',
  OUTROS: 'Outros',
};

export const EXAM_CATEGORY_OPTIONS: { key: string; label: string }[] =
  Object.entries(EXAM_CATEGORY_LABELS).map(([key, label]) => ({ key, label }));

export function formatExamCategory(category?: string | null): string {
  return (category && EXAM_CATEGORY_LABELS[category]) || category || 'Outros';
}
