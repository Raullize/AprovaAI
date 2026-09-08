import api from './api';

export interface DashboardStats {
  activeDays: number[];
  streakCount: number;
}

export interface LeaderboardUser {
  rank: number;
  fullName: string;
  username: string;
  xp: number;
}

export interface LeaderboardResponse {
  topUsers: LeaderboardUser[];
  currentUserRank: number;
  currentUserEntry: LeaderboardUser | null;
}

export interface StreakLeaderboardUser {
  rank: number;
  fullName: string;
  username: string;
  bestStreak: number;
  streakCount: number;
}

export interface StreakLeaderboardResponse {
  topUsers: StreakLeaderboardUser[];
  currentUserRank: number;
  currentUserEntry: StreakLeaderboardUser | null;
}

export const studentService = {
  getDashboardStats: async (month?: string): Promise<DashboardStats> => {
    const url = month
      ? `/student/dashboard-stats?month=${month}`
      : '/student/dashboard-stats';
    const response = await api.get<DashboardStats>(url);
    return response.data;
  },

  getLeaderboard: async (): Promise<LeaderboardResponse> => {
    const response = await api.get<LeaderboardResponse>('/student/leaderboard');
    return response.data;
  },

  getStreakLeaderboard: async (): Promise<StreakLeaderboardResponse> => {
    const response = await api.get<StreakLeaderboardResponse>(
      '/student/streak-leaderboard',
    );
    return response.data;
  },
};
