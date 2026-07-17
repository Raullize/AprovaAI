import type { ApiSimulationHistoryItem } from '../services/simulation-attempts.service';

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
  simulationsCountPerExam: Record<string, number> = {},
  limit = 3,
): RecentExam[] {
  return Array.from(
    new Map(
      history
        .filter(
          (h) =>
            h.simulation?.topic?.exam?.name &&
            (h.simulation?.topic?.exam?.slug || h.simulation?.topic?.exam?.id),
        )
        .map((h) => {
          const examKey =
            h.simulation?.topic?.exam?.id ??
            h.simulation?.topic?.exam?.slug ??
            h.simulation?.topic?.exam?.name ??
            'unknown-exam';

          const examHistory = history.filter(
            (item) =>
              (item.simulation?.topic?.exam?.id ??
                item.simulation?.topic?.exam?.slug ??
                item.simulation?.topic?.exam?.name) === examKey &&
              item.status === 'COMPLETED',
          );

          const completedSimulations = new Set(examHistory.map((item) => item.simulationId));
          const totalEstimated = simulationsCountPerExam[examKey] || 10;
          const progress = Math.min(
            100,
            Math.round((completedSimulations.size / totalEstimated) * 100),
          );

          return [
            examKey,
            {
              id: examKey,
              routeId:
                h.simulation!.topic!.exam!.slug ||
                h.simulation!.topic!.exam!.id ||
                examKey,
              title: h.simulation!.topic!.exam!.name!,
              iconKey: h.simulation?.topic?.exam?.iconKey || 'cpu',
              colorScheme: h.simulation?.topic?.exam?.colorScheme || 'orange',
              lastTopic: h.simulation?.name || '',
              progress,
            } satisfies RecentExam,
          ];
        }),
    ).values(),
  ).slice(0, limit);
}
