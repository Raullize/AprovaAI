export function resolveImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http')) return imageUrl;
  const baseUrl = import.meta.env.VITE_STATIC_URL || 'http://localhost:3001';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}
