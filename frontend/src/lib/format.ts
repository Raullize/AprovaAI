export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function formatTimeLimit(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return 'Sem limite';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0 && remainingSeconds > 0)
    return `${minutes} min ${remainingSeconds}s`;
  if (minutes > 0) return `${minutes} min`;
  return `${remainingSeconds}s`;
}
