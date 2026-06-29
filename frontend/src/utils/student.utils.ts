import type { ApiSimulationHistoryItem } from '../services/simulations.service';

export interface RecentExam {
  id: string;
  routeId: string;
  title: string;
  iconKey: string;
  colorScheme: string;
  lastTopic: string;
  progress: number;
}

/**
 * Derives a list of unique recent exams from the raw simulation history.
 * Calculates an estimated progress percentage based on distinct completed levels.
 */
export function getRecentExamsFromHistory(
  history: ApiSimulationHistoryItem[],
  limit = 3,
): RecentExam[] {
  return Array.from(
    new Map(
      history
        .filter(
          (h) =>
            h.level?.topic?.exam?.name &&
            (h.level?.topic?.exam?.slug || h.level?.topic?.exam?.id),
        )
        .map((h) => {
          const examKey =
            h.level?.topic?.exam?.id ??
            h.level?.topic?.exam?.slug ??
            h.level?.topic?.exam?.name ??
            'unknown-exam';

          const examHistory = history.filter(
            (item) =>
              (item.level?.topic?.exam?.id ??
                item.level?.topic?.exam?.slug ??
                item.level?.topic?.exam?.name) === examKey &&
              item.status === 'COMPLETED',
          );

          const completedLevels = new Set(examHistory.map((item) => item.levelId));
          const totalEstimated = 10;
          const progress = Math.min(
            100,
            Math.round((completedLevels.size / totalEstimated) * 100),
          );

          return [
            examKey,
            {
              id: examKey,
              routeId:
                h.level!.topic!.exam!.slug ||
                h.level!.topic!.exam!.id ||
                examKey,
              title: h.level!.topic!.exam!.name!,
              iconKey: h.level?.topic?.exam?.iconKey || 'cpu',
              colorScheme: h.level?.topic?.exam?.colorScheme || 'orange',
              lastTopic: h.level?.name || '',
              progress,
            } satisfies RecentExam,
          ];
        }),
    ).values(),
  ).slice(0, limit);
}
