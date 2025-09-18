/**
 * Gera um slug a partir de um texto
 * @param text - Texto para converter em slug
 * @returns Slug gerado
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return 'untitled';
  }

  const slug = text
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim

  // Se o slug resultante estiver vazio, retorna um valor padrão
  return slug || 'untitled';
}

/**
 * Gera um slug único verificando se já existe no banco
 * @param baseSlug - Slug base
 * @param checkExists - Função para verificar se o slug já existe
 * @returns Slug único
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
