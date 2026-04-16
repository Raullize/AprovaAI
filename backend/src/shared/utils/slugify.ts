export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function generateUniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = generateSlug(text);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await checkExists(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
